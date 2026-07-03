import { CloverService } from "@global/clover/clover.service";
import { CommunicationService } from "@global/communication/communication.service";
import { PrismaService } from "@global/prisma/prisma.service";
import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { NotificationService } from "../../notification/notification.service";
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
        throw new UnprocessableEntityException("Card number must be between 13 and 19 digits.");
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
        throw new UnprocessableEntityException("Expiry date must be in MM/YY format (e.g. 08/27).");
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
        private readonly notificationService: NotificationService,
        private readonly prisma: PrismaService,
        private readonly cloverService: CloverService,
        private readonly communicationService: CommunicationService,
    ) {}

    async checkout(userId: string, dto: CheckoutDto) {
        // 1. Validate card info upfront
        validateCardInfo(
            dto.paymentInfo.cardNumber,
            dto.paymentInfo.expiredDate,
            dto.paymentInfo.cvv,
        );

        // 2. Verify Assessment Submission
        let submission: Awaited<
            ReturnType<typeof this.paymentRepository.findSubmissionById>
        > | null = null;
        if (dto.submissionId) {
            const rawSubmission = await this.paymentRepository.findSubmissionByIdAny(
                dto.submissionId,
                userId,
            );

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
        const isSubscribing = !!dto.submissionId;
        if (!hasCartItems && !isSubscribing) {
            throw new BadRequestException(
                "Your cart is empty and no service assessment is provided. Please add products to your cart or provide a submissionId to proceed.",
            );
        }

        // 6. Resolve payment plan & category for subscription
        let paymentPlan: { id: string; price: any; billingCycle: string } | null = null;
        let categoryId: string | null = null;

        if (isSubscribing) {
            if (!submission) {
                throw new BadRequestException("submissionId is invalid.");
            }

            if (!submission.assessment?.category?.paymentPlan) {
                throw new BadRequestException(
                    "The service category linked to this assessment does not have an active payment plan. Please contact support.",
                );
            }

            paymentPlan = submission.assessment.category.paymentPlan;
            categoryId = submission.assessment.category.id;

            // Check for existing active subscription under the same category
            const existingSubscription = await this.paymentRepository.findActiveSubscription(
                userId,
                categoryId!,
            );
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

        // 10. Tokenize card first (get reusable token for recurring billing)
        const cloverCardToken = await this.cloverService.createReusableCardToken({
            cardNumber: dto.paymentInfo.cardNumber,
            expiredDate: dto.paymentInfo.expiredDate,
            cvv: dto.paymentInfo.cvv,
            cardHolderName: dto.paymentInfo.cardHolderName,
        });

        // 11. Charge the card using the token
        const cloverCharge = await this.cloverService.chargeWithSavedToken({
            savedToken: cloverCardToken,
            totalAmountUSD: total,
            description: `Doc App payment - $${total}`,
        });

        // 12. Extract card info from Clover response (fallback to local detection)
        const last4 =
            cloverCharge.last4 || dto.paymentInfo.cardNumber.replace(/\s+/g, "").slice(-4);
        const brand = cloverCharge.brand || detectCardBrand(dto.paymentInfo.cardNumber);
        const cloverChargeId = cloverCharge.id;

        // 13. Execute DB transaction (payment already confirmed by Clover)
        const result = await this.paymentRepository.executeCheckoutTransaction(
            userId,
            dto.submissionId,
            cart,
            {
                subtotal,
                discountAmount,
                shippingCharge,
                total,
                shippingInfo: dto.shippingInfo,
                complianceConfirmation: dto.complianceConfirmation,
                discountId,
                isSubscribing,
                autoRenew: dto.isRecurring ?? false,
                billingCycle: dto.billingCycle,
                paymentPlan,
                categoryId: categoryId ?? "",
                paymentType,
                last4,
                brand,
                cloverChargeId,
                cloverCardToken,
            },
        );

        // Fetch user for notification
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { name: true, email: true, patientProfile: { select: { name: true } } },
        });
        const patientName = user?.patientProfile?.name ?? user?.email ?? "A patient";

        // Notifications
        await this.notificationService.sendToAdmins({
            title: "Payment Successful",
            message: `${patientName} has successfully made a payment of $${total}.`,
            actionType: "PAYMENT_SUCCESS",
            referenceId: result.transactionId,
        });

        if (dto.submissionId && submission) {
            await this.notificationService.sendToAdmins({
                title: "New Assessment Submitted",
                message: `${patientName} has submitted a new assessment (Code: ${submission.submissionCode}).`,
                actionType: "ASSESSMENT_SUBMITTED",
                referenceId: dto.submissionId,
            });
        }

        // Email to patient
        if (user?.email) {
            await this.communicationService
                .dispatch({
                    action: "PAYMENT_RECEIPT",
                    channel: "EMAIL",
                    to: user.email,
                    payload: {
                        name: patientName,
                        amount: total,
                        orderId: result.orderNumber,
                        transactionId: result.transactionId,
                    },
                })
                .catch((err) => console.error("Failed to send payment receipt email:", err));

            if (dto.submissionId && submission) {
                await this.communicationService
                    .dispatch({
                        action: "ASSESSMENT_SUBMITTED",
                        channel: "EMAIL",
                        to: user.email,
                        payload: { name: patientName },
                    })
                    .catch((err) =>
                        console.error("Failed to send assessment submitted email:", err),
                    );
            }

            if (hasCartItems) {
                const itemDetails = (cart?.items ?? [])
                    .map((item) => `- ${item.quantity}x ${item.product.name}`)
                    .join("\\n");
                await this.communicationService
                    .dispatch({
                        action: "ORDER_CONFIRMATION",
                        channel: "EMAIL",
                        to: user.email,
                        payload: {
                            name: patientName,
                            orderId: result.orderNumber,
                            amount: total,
                            items: itemDetails,
                        },
                    })
                    .catch((err) => console.error("Failed to send order confirmation email:", err));
            }
        }

        return result;
    }
}
