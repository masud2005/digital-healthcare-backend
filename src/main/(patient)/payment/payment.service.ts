import { BadRequestException, ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { CartRepository } from "../cart/cart.repository";
import type { CheckoutDto } from "./dto/checkout.dto";
import { PaymentRepository } from "./payment.repository";

const SHIPPING_CHARGE = 20;

function detectCardBrand(cardNumber: string): string {
    const num = cardNumber.replace(/\s+/g, "");
    if (/^4/.test(num)) return "Visa";
    if (/^5[1-5]/.test(num) || /^2[2-7]/.test(num)) return "MasterCard";
    if (/^3[47]/.test(num)) return "Amex";
    if (/^6(?:011|5)/.test(num)) return "Discover";
    if (/^3(?:0[0-5]|[68])/.test(num)) return "Diners";
    if (/^35/.test(num)) return "JCB";
    return "Unknown";
}

function validateCardInfo(cardNumber: string, expiredDate: string, cvv: string) {
    const num = cardNumber.replace(/\s+/g, "");

    if (!/^\d{13,19}$/.test(num)) {
        throw new UnprocessableEntityException(
            "Card number must be between 13 and 19 digits.",
        );
    }

    // Luhn check
    let sum = 0;
    let shouldDouble = false;
    for (let i = num.length - 1; i >= 0; i--) {
        let digit = parseInt(num[i], 10);
        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        shouldDouble = !shouldDouble;
    }
    if (sum % 10 !== 0) {
        throw new UnprocessableEntityException("Card number is invalid.");
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiredDate)) {
        throw new UnprocessableEntityException(
            "Expiry date must be in MM/YY format (e.g. 08/27).",
        );
    }
    const [expMonth, expYear] = expiredDate.split("/").map(Number);
    const now = new Date();
    const fullExpYear = 2000 + expYear;
    if (
        fullExpYear < now.getFullYear() ||
        (fullExpYear === now.getFullYear() && expMonth < now.getMonth() + 1)
    ) {
        throw new UnprocessableEntityException("Card has expired.");
    }

    if (!/^\d{3,4}$/.test(cvv)) {
        throw new UnprocessableEntityException("CVV must be 3 or 4 digits.");
    }
}

@Injectable()
export class PaymentService {
    constructor(
        private readonly paymentRepository: PaymentRepository,
        private readonly cartRepository: CartRepository,
    ) {}

    async checkout(userId: string, dto: CheckoutDto) {
        // 1. Validate card info upfront
        validateCardInfo(
            dto.paymentInfo.cardNumber,
            dto.paymentInfo.expiredDate,
            dto.paymentInfo.cvv,
        );

        // 2. Verify Assessment Submission
        let submission: Awaited<ReturnType<typeof this.paymentRepository.findSubmissionById>> | null = null;
        if (dto.submissionId) {
            const rawSubmission = await this.paymentRepository.findSubmissionByIdAny(dto.submissionId, userId);

            if (!rawSubmission) {
                throw new NotFoundException(
                    "Assessment submission not found or does not belong to you.",
                );
            }
            if (rawSubmission.status !== "DRAFT") {
                throw new BadRequestException(
                    `This submission cannot be checked out because its current status is "${rawSubmission.status}". Only DRAFT submissions are allowed.`,
                );
            }
            if (rawSubmission.complianceConfirmation) {
                throw new ConflictException(
                    "This submission has already been submitted and paid for.",
                );
            }
            submission = rawSubmission;
        }

        // 3. Compliance confirmation required when submissionId is provided
        if (dto.submissionId) {
            if (!dto.complianceConfirmation) {
                throw new BadRequestException(
                    "complianceConfirmation is required when submissionId is provided.",
                );
            }
            const cc = dto.complianceConfirmation;
            if (!cc.agreedToTermsAndPrivacy) {
                throw new BadRequestException(
                    "You must agree to the Terms and Privacy Policy to proceed.",
                );
            }
            if (!cc.certifiedInfoAccurate) {
                throw new BadRequestException(
                    "You must certify that the information provided is accurate.",
                );
            }
            if (!cc.understoodFalseInfoConsequences) {
                throw new BadRequestException(
                    "You must acknowledge the consequences of providing false information.",
                );
            }
            if (!cc.understoodRecommendationsBasis) {
                throw new BadRequestException(
                    "You must acknowledge the basis on which recommendations are made.",
                );
            }
            if (!cc.understoodAdditionalInfoMayBeRequested) {
                throw new BadRequestException(
                    "You must acknowledge that additional information may be requested.",
                );
            }
        }

        // 4. Fetch cart and validate items
        const cart = await this.cartRepository.findCartByUserId(userId);
        const hasCartItems = (cart?.items?.length ?? 0) > 0;

        if (hasCartItems) {
            for (const item of cart!.items) {
                const product = item.product;

                if (item.size) {
                    const variant = product.variants.find((v) => v.size === item.size);
                    if (!variant) {
                        throw new UnprocessableEntityException(
                            `Size "${item.size}" is no longer available for "${product.name}". Please update your cart.`,
                        );
                    }
                    if (variant.stockQuantity < item.quantity) {
                        throw new UnprocessableEntityException(
                            `"${product.name}" (size: ${item.size}) only has ${variant.stockQuantity} unit(s) in stock but you requested ${item.quantity}.`,
                        );
                    }
                } else {
                    const stock = product.stockQuantity ?? 0;
                    if (stock < item.quantity) {
                        throw new UnprocessableEntityException(
                            `"${product.name}" only has ${stock} unit(s) in stock but you requested ${item.quantity}.`,
                        );
                    }
                }
            }
        }

        // 5. Validate: must be buying something
        const isSubscribing = dto.isRecurring === true;
        if (!hasCartItems && !isSubscribing) {
            throw new BadRequestException(
                "Your cart is empty and isRecurring is not enabled. Please add products to your cart or enable isRecurring to subscribe.",
            );
        }

        // 6. Resolve payment plan & category for subscription
        let paymentPlan: { id: string; price: any; billingCycle: string } | null = null;
        let categoryId: string | null = null;

        if (isSubscribing) {
            if (!dto.submissionId || !submission) {
                throw new BadRequestException(
                    "submissionId is required when isRecurring is true.",
                );
            }

            if (!submission.assessment?.category?.paymentPlan) {
                throw new BadRequestException(
                    "The service category linked to this assessment does not have an active payment plan. Please contact support.",
                );
            }

            paymentPlan = submission.assessment.category.paymentPlan;
            categoryId = submission.assessment.category.id;

            // Check for existing active subscription under the same category
            const existingSubscription = await this.paymentRepository.findActiveSubscription(userId, categoryId!);
            if (existingSubscription) {
                throw new ConflictException(
                    "You already have an active subscription for this service category.",
                );
            }
        }

        // 7. Apply and validate discount code
        let discountId: string | undefined;
        let discountAmount = 0;

        if (dto.discountCode) {
            const trimmedCode = dto.discountCode.trim();
            if (!trimmedCode) {
                throw new BadRequestException("Discount code cannot be empty.");
            }

            const discount = await this.cartRepository.findActiveDiscount(trimmedCode);
            if (!discount) {
                throw new BadRequestException(
                    `Discount code "${trimmedCode}" is invalid or has expired.`,
                );
            }
            discountId = discount.id;

            const rawSubtotal = (cart?.items ?? []).reduce((sum, item) => {
                const variant = item.size
                    ? item.product.variants.find((v) => v.size === item.size)
                    : null;
                const price = variant ? Number(variant.price) : Number(item.product.price);
                return sum + price * item.quantity;
            }, 0);

            const serviceFee = paymentPlan ? Number(paymentPlan.price) : 0;
            const discountBase = rawSubtotal + serviceFee;

            discountAmount =
                discount.type === "PERCENTAGE"
                    ? +(discountBase * (Number(discount.value) / 100)).toFixed(2)
                    : +Math.min(Number(discount.value), discountBase).toFixed(2);
        }

        // 8. Calculate totals
        const productSubtotal = (cart?.items ?? []).reduce((sum, item) => {
            const variant = item.size
                ? item.product.variants.find((v) => v.size === item.size)
                : null;
            const price = variant ? Number(variant.price) : Number(item.product.price);
            return sum + price * item.quantity;
        }, 0);

        const serviceFee = paymentPlan ? Number(paymentPlan.price) : 0;
        const subtotal = +(productSubtotal + serviceFee).toFixed(2);
        const shippingCharge = hasCartItems ? SHIPPING_CHARGE : 0;
        const total = +(subtotal + shippingCharge - discountAmount).toFixed(2);

        if (total < 0) {
            throw new UnprocessableEntityException(
                "Calculated total is negative. The discount amount exceeds the order total.",
            );
        }

        // 9. Determine payment types
        const paymentType: ("FEES" | "PRODUCT")[] = [];
        if (isSubscribing) paymentType.push("FEES");
        if (hasCartItems) paymentType.push("PRODUCT");

        // 10. Extract card info
        const last4 = dto.paymentInfo.cardNumber.replace(/\s+/g, "").slice(-4);
        const brand = detectCardBrand(dto.paymentInfo.cardNumber);

        // 11. Execute transaction
        return this.paymentRepository.executeCheckoutTransaction(userId, dto.submissionId, cart, {
            subtotal,
            discountAmount,
            shippingCharge,
            total,
            shippingInfo: dto.shippingInfo,
            complianceConfirmation: dto.complianceConfirmation,
            discountId,
            isRecurring: isSubscribing,
            billingCycle: dto.billingCycle,
            paymentPlan,
            categoryId: categoryId ?? "",
            paymentType,
            last4,
            brand,
        });
    }
}
