import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CartRepository } from "../cart/cart.repository";
import type { CheckoutDto } from "./dto/checkout.dto";
import { PaymentRepository } from "./payment.repository";

const SHIPPING_CHARGE = 20;

@Injectable()
export class PaymentService {
    constructor(
        private readonly paymentRepository: PaymentRepository,
        private readonly cartRepository: CartRepository,
    ) {}

    async checkout(userId: string, dto: CheckoutDto) {
        // 1. Verify Assessment Submission
        const submission = await this.paymentRepository.findSubmissionById(dto.submissionId, userId);
        if (!submission) {
            throw new NotFoundException("Valid draft assessment submission not found.");
        }

        // 2. Fetch User's Cart
        const cart = await this.cartRepository.findCartByUserId(userId);
        if (!cart || cart.items.length === 0) {
            throw new BadRequestException("Your cart is empty.");
        }

        // 3. Fetch User Category (fallback to cart item category)
        const user = await this.cartRepository.findUserWithCategory(userId);

        // 4. Calculate Subtotal
        let subtotal = 0;
        for (const item of cart.items) {
            const activeVariant = item.size
                ? item.product.variants.find((v) => v.size === item.size)
                : null;
            const unitPrice = activeVariant ? Number(activeVariant.price) : Number(item.product.price ?? 0);
            subtotal += unitPrice * item.quantity;
        }

        // 5. Calculate Service Fees & Subscription plan
        const paymentPlan = user?.category?.paymentPlan ?? cart.items[0]?.product?.category?.paymentPlan ?? null;
        let categoryId = user?.categoryId;

        if (!categoryId && cart.items.length > 0) {
            categoryId = cart.items[0].product.categoryId;
        }

        const serviceFees = paymentPlan ? Number(paymentPlan.price) : 0;
        const shippingCharge = SHIPPING_CHARGE;

        // 6. Calculate Discount
        let discount = 0;
        let discountId: string | undefined = undefined;

        if (dto.discountCode) {
            const found = await this.cartRepository.findActiveDiscount(dto.discountCode);
            if (!found) {
                throw new BadRequestException("Invalid or expired discount code.");
            }
            discountId = found.id;
            const baseForDiscount = subtotal + serviceFees + shippingCharge;
            discount = found.type === "PERCENTAGE"
                ? parseFloat(((baseForDiscount * found.value) / 100).toFixed(2))
                : parseFloat(Math.min(found.value, baseForDiscount).toFixed(2));
        }

        const total = parseFloat((subtotal + serviceFees + shippingCharge - discount).toFixed(2));



        // 7. Execute Transaction
        const result = await this.paymentRepository.executeCheckoutTransaction(userId, dto.submissionId, cart, {
            subtotal,
            discountAmount: discount,
            shippingCharge,
            total,
            shippingInfo: dto.shippingInfo,
            complianceConfirmation: dto.complianceConfirmation,
            discountId,
            isRecurring: dto.isRecurring ?? false,
            paymentPlan,
            categoryId: categoryId as string, // Will fix this in a bit
        });

        return {
            success: true,
            statusCode: 201,
            message: "Payment successful and checkout completed.",
            data: result,
        };
    }
}
