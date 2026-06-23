import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import type { AcceptProposalDto } from "./dto/proposal.dto";
import { ProposalRepository } from "./proposal.repository";

function detectCardBrand(cardNumber: string): string {
    const num = cardNumber.replace(/\s+/g, "");
    if (/^4/.test(num)) return "Visa";
    if (/^5[1-5]/.test(num) || /^2[2-7]/.test(num)) return "MasterCard";
    if (/^3[47]/.test(num)) return "Amex";
    if (/^6(?:011|5)/.test(num)) return "Discover";
    return "Unknown";
}

function validateCard(cardNumber: string, expiryDate: string, cvv: string) {
    const num = cardNumber.replace(/\s+/g, "");
    if (!/^\d{13,19}$/.test(num)) throw new UnprocessableEntityException("Card number must be 13–19 digits.");

    let sum = 0, shouldDouble = false;
    for (let i = num.length - 1; i >= 0; i--) {
        let digit = parseInt(num[i], 10);
        if (shouldDouble) { digit *= 2; if (digit > 9) digit -= 9; }
        sum += digit;
        shouldDouble = !shouldDouble;
    }
    if (sum % 10 !== 0) throw new UnprocessableEntityException("Card number is invalid.");

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) throw new UnprocessableEntityException("Expiry date must be MM/YY.");
    const [m, y] = expiryDate.split("/").map(Number);
    const now = new Date();
    if (2000 + y < now.getFullYear() || (2000 + y === now.getFullYear() && m < now.getMonth() + 1)) {
        throw new UnprocessableEntityException("Card has expired.");
    }

    if (!/^\d{3,4}$/.test(cvv)) throw new UnprocessableEntityException("CVV must be 3 or 4 digits.");
}

@Injectable()
export class ProposalService {
    constructor(private readonly repo: ProposalRepository) {}

    async rejectProposal(proposalId: string, userId: string) {
        const proposal = await this.repo.findById(proposalId);
        if (!proposal) throw new NotFoundException("Proposal not found.");

        const { patientId, providerId } = proposal.message.conversation;
        if (userId !== patientId && userId !== providerId) throw new ForbiddenException("Access denied.");

        if (proposal.status === "REJECTED") throw new BadRequestException("Proposal has already been rejected.");
        if (proposal.status === "ACCEPTED") throw new BadRequestException("Accepted proposals cannot be rejected.");
        if (proposal.status === "EXPIRED") throw new BadRequestException("Expired proposals cannot be rejected.");

        return this.repo.rejectProposal(proposalId);
    }

    async acceptProposal(proposalId: string, userId: string, dto: AcceptProposalDto) {
        const proposal = await this.repo.findById(proposalId);
        if (!proposal) throw new NotFoundException("Proposal not found.");

        const { patientId } = proposal.message.conversation;
        if (userId !== patientId) throw new ForbiddenException("Only the patient can accept a proposal.");

        if (proposal.status === "ACCEPTED") throw new BadRequestException("Proposal has already been accepted.");
        if (proposal.status === "REJECTED") throw new BadRequestException("Rejected proposals cannot be accepted.");
        if (proposal.status === "EXPIRED") throw new BadRequestException("Expired proposals cannot be accepted.");

        validateCard(dto.cardNumber, dto.expiryDate, dto.cvv);

        const last4 = dto.cardNumber.replace(/\s+/g, "").slice(-4);
        const brand = detectCardBrand(dto.cardNumber);

        await this.repo.acceptProposal(proposalId);

        const payment = await this.repo.createPayment({
            userId,
            proposalId,
            amount: Number(proposal.fee),
            last4,
            brand,
            paymentMethod: dto.paymentMethod,
        });

        return { proposalId, transactionId: payment.transactionId, amount: payment.amount, status: "success" };
    }
}
