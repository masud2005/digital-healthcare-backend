import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ProposalRepository {
    constructor(private readonly prisma: PrismaService) {}

    findById(id: string) {
        return this.prisma.proposal.findUnique({
            where: { id },
            select: { id: true, status: true, fee: true, messageId: true, message: { select: { conversationId: true, conversation: { select: { patientId: true, providerId: true } } } } },
        });
    }

    rejectProposal(id: string) {
        return this.prisma.proposal.update({
            where: { id },
            data: { status: "REJECTED" },
        });
    }

    acceptProposal(id: string) {
        return this.prisma.proposal.update({
            where: { id },
            data: { status: "ACCEPTED" },
        });
    }

    createPayment(data: {
        userId: string;
        proposalId: string;
        amount: number;
        last4: string;
        brand: string;
        paymentMethod: string;
        cloverChargeId: string;
    }) {
        const transactionId = data.cloverChargeId;
        return this.prisma.payment.create({
            data: {
                transactionId,
                amount: data.amount,
                currency: "USD",
                status: "COMPLETED",
                method: data.paymentMethod as any,
                last4: data.last4,
                brand: data.brand,
                paymentType: ["FEES"],
                paidAt: new Date(),
                userId: data.userId,
                proposalId: data.proposalId,
            },
        });
    }
}
