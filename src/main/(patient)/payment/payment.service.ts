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

    }
}
