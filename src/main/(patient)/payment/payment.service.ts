import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
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

@Injectable()
export class PaymentService {
    constructor(
        private readonly paymentRepository: PaymentRepository,
        private readonly cartRepository: CartRepository,
    ) {}

    async checkout(userId: string, dto: CheckoutDto) {
        // 1. Verify Assessment Submission (optional — required only for subscription or compliance flows)
        let submission: Awaited<ReturnType<typeof this.paymentRepository.findSubmissionById>> | null = null;
        if (dto.submissionId) {
            submission = await this.paymentRepository.findSubmissionById(dto.submissionId, userId);
            if (!submission) {
                throw new NotFoundException("Valid draft assessment submission not found.");
            }
        }

        // 2. Fetch User's Cart
        const cart = await this.cartRepository.findCartByUserId(userId);
        const hasCartItems = (cart?.items?.length ?? 0) > 0;

        // 3. Validate: must be buying something
        const isSubscribing = dto.isRecurring === true;
        if (!hasCartItems && !isSubscribing) {
            throw new BadRequestException(
                "Nothing to purchase. Add products to your cart or enable isRecurring to subscribe.",
            );
        }

        // 4. Fetch User Category (for subscription plan)
        const user = await this.cartRepository.findUserWithCategory(userId);

        // 5. Calculate Subtotal from cart products
        let productSubtotal = 0;
        if (hasCartItems && cart?.items) {
            for (const item of cart.items) {
                const activeVariant = item.size
                    ? item.product.variants.find((v) => v.size === item.size)
                    : null;
                const unitPrice = activeVariant ? Number(activeVariant.price) : Number(item.product.price ?? 0);
                productSubtotal += unitPrice * item.quantity;
            }
        }

        // 6. Resolve PaymentPlan and CategoryId for subscription
        const paymentPlan =
            user?.category?.paymentPlan ??
            submission?.assessment?.category?.paymentPlan ??
            cart?.items?.[0]?.product?.category?.paymentPlan ??
            null;

        let categoryId: string | null | undefined =
            user?.categoryId ?? submission?.assessment?.category?.id;

        if (!categoryId && (cart?.items?.length ?? 0) > 0) {
            categoryId = cart?.items?.[0]?.product?.categoryId;
        }

        // 7. Calculate service fees (subscription price)
        const serviceFees = isSubscribing && paymentPlan ? Number(paymentPlan.price) : 0;

        // 8. Determine paymentType
        const paymentType: ("FEES" | "PRODUCT")[] = [];
        if (hasCartItems) paymentType.push("PRODUCT");
        if (isSubscribing && serviceFees > 0) paymentType.push("FEES");

        // 9. Shipping charge (only if there are physical products)
        const shippingCharge = hasCartItems ? SHIPPING_CHARGE : 0;

        // 10. Calculate Discount
        let discount = 0;
        let discountId: string | undefined = undefined;

        if (dto.discountCode) {
            const found = await this.cartRepository.findActiveDiscount(dto.discountCode);
            if (!found) {
                throw new BadRequestException("Invalid or expired discount code.");
            }
            discountId = found.id;
            const baseForDiscount = productSubtotal + serviceFees + shippingCharge;
            discount =
                found.type === "PERCENTAGE"
                    ? parseFloat(((baseForDiscount * Number(found.value)) / 100).toFixed(2))
                    : parseFloat(Math.min(Number(found.value), baseForDiscount).toFixed(2));
        }

        const total = parseFloat((productSubtotal + serviceFees + shippingCharge - discount).toFixed(2));

        // 11. Extract card last4 and brand
        const rawCard = dto.paymentInfo.cardNumber.replace(/\s+/g, "");
        const last4 = rawCard.slice(-4);
        const brand = detectCardBrand(rawCard);

        // 12. Execute Transaction
        const result = await this.paymentRepository.executeCheckoutTransaction(userId, dto.submissionId, cart, {
            subtotal: productSubtotal,
            discountAmount: discount,
            shippingCharge,
            total,
            shippingInfo: dto.shippingInfo,
            complianceConfirmation: dto.complianceConfirmation,
            discountId,
            isRecurring: isSubscribing,
            billingCycle: dto.billingCycle,
            paymentPlan,
            categoryId: categoryId as string,
            paymentType,
            last4,
            brand,
        });

        return {
            success: true,
            statusCode: 201,
            message: "Payment successful and checkout completed.",
            data: result,
        };
    }
}
