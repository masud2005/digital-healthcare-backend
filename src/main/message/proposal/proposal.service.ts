import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnprocessableEntityException,
} from "@nestjs/common";
import type { AcceptProposalDto } from "./dto/proposal.dto";
import { ProposalRepository } from "./proposal.repository";
import { NotificationService } from "../../notification/notification.service";
import { PrismaService } from "@global/prisma/prisma.service";
import { CloverService } from "@global/clover/clover.service";
import { CommunicationService } from "@global/communication/communication.service";

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
    if (!/^\d{13,19}$/.test(num))
        throw new UnprocessableEntityException("Card number must be 13–19 digits.");

    let sum = 0,
        shouldDouble = false;
    for (let i = num.length - 1; i >= 0; i--) {
        let digit = parseInt(num[i], 10);
        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        shouldDouble = !shouldDouble;
    }
    if (sum % 10 !== 0) throw new UnprocessableEntityException("Card number is invalid.");

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate))
        throw new UnprocessableEntityException("Expiry date must be MM/YY.");
    const [m, y] = expiryDate.split("/").map(Number);
    const now = new Date();
    if (
        2000 + y < now.getFullYear() ||
        (2000 + y === now.getFullYear() && m < now.getMonth() + 1)
    ) {
        throw new UnprocessableEntityException("Card has expired.");
    }

    if (!/^\d{3,4}$/.test(cvv))
        throw new UnprocessableEntityException("CVV must be 3 or 4 digits.");
}

@Injectable()
export class ProposalService {
    constructor(
        private readonly repo: ProposalRepository,
        private readonly notificationService: NotificationService,
        private readonly prisma: PrismaService,
        private readonly cloverService: CloverService,
        private readonly communicationService: CommunicationService,
    ) {}

    async rejectProposal(proposalId: string, userId: string) {
        const proposal = await this.repo.findById(proposalId);
        if (!proposal) throw new NotFoundException("Proposal not found.");

        const { patientId, providerId } = proposal.message.conversation;
        if (userId !== patientId && userId !== providerId)
            throw new ForbiddenException("Access denied.");

        if (proposal.status === "REJECTED")
            throw new BadRequestException("Proposal has already been rejected.");
        if (proposal.status === "ACCEPTED")
            throw new BadRequestException("Accepted proposals cannot be rejected.");
        if (proposal.status === "EXPIRED")
            throw new BadRequestException("Expired proposals cannot be rejected.");

        const result = await this.repo.rejectProposal(proposalId);

        // Fetch names
        const patient = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { name: true, patientProfile: { select: { name: true } } },
        });
        const doctor = await this.prisma.user.findUnique({
            where: { id: providerId },
            select: { name: true, email: true, doctorProfile: { select: { name: true } } },
        });
        const patientName = patient?.patientProfile?.name ?? patient?.name ?? "A patient";
        const doctorName = doctor?.doctorProfile?.name ?? doctor?.name ?? "a doctor";

        // Notify Doctor
        await this.notificationService.send({
            userId: providerId,
            title: "Proposal Rejected",
            message: `${patientName} has rejected your proposal.`,
            actionType: "PROPOSAL_REJECTED",
            referenceId: proposalId,
        });

        if (doctor?.email) {
            await this.communicationService
                .dispatch({
                    action: "PROPOSAL_REJECTED",
                    channel: "EMAIL",
                    to: doctor.email,
                    payload: { name: patientName },
                })
                .catch((err) => console.error("Failed to send proposal rejected email:", err));
        }

        // Notify Admins
        await this.notificationService.sendToAdmins({
            title: "Proposal Rejected",
            message: `${patientName} has rejected ${doctorName}'s proposal.`,
            actionType: "PROPOSAL_REJECTED",
            referenceId: proposalId,
        });

        return result;
    }

    async acceptProposal(proposalId: string, userId: string, dto: AcceptProposalDto) {
        const proposal = await this.repo.findById(proposalId);
        if (!proposal) throw new NotFoundException("Proposal not found.");

        const { patientId } = proposal.message.conversation;
        if (userId !== patientId)
            throw new ForbiddenException("Only the patient can accept a proposal.");

        if (proposal.status === "ACCEPTED")
            throw new BadRequestException("Proposal has already been accepted.");
        if (proposal.status === "REJECTED")
            throw new BadRequestException("Rejected proposals cannot be accepted.");
        if (proposal.status === "EXPIRED")
            throw new BadRequestException("Expired proposals cannot be accepted.");

        let cloverCardToken: string;
        let last4: string = "****";
        let brand: string = "Card";

        if (dto.savedCardId) {
            const savedCard = await this.prisma.paymentCard.findFirst({
                where: { id: dto.savedCardId, userId },
            });
            if (!savedCard) {
                throw new NotFoundException("Saved payment card not found.");
            }
            cloverCardToken = savedCard.cloverToken;
            last4 = savedCard.last4;
            brand = savedCard.brand;
        } else if (dto.cloverToken) {
            cloverCardToken = dto.cloverToken;
            if (dto.cardNumber) {
                last4 = dto.cardNumber.replace(/\s+/g, "").slice(-4);
                brand = detectCardBrand(dto.cardNumber);
            }
        } else if (dto.cardNumber && dto.expiryDate && dto.cvv && dto.cardholderName) {
            validateCard(dto.cardNumber, dto.expiryDate, dto.cvv);
            cloverCardToken = await this.cloverService.createReusableCardToken({
                cardNumber: dto.cardNumber,
                expiredDate: dto.expiryDate,
                cvv: dto.cvv,
                cardHolderName: dto.cardholderName,
            });
            last4 = dto.cardNumber.replace(/\s+/g, "").slice(-4);
            brand = detectCardBrand(dto.cardNumber);
        } else {
            throw new BadRequestException("Must provide savedCardId, cloverToken, or complete raw card details.");
        }

        // Charge via Clover
        const cloverCharge = await this.cloverService.chargeWithSavedToken({
            savedToken: cloverCardToken,
            totalAmountUSD: Number(proposal.fee),
            description: `Doc App Proposal Payment - $${proposal.fee}`,
        });

        // Extract card details from Clover response
        last4 = cloverCharge.last4 || last4;
        brand = cloverCharge.brand || brand;
        const cloverChargeId = cloverCharge.id;

        await this.repo.acceptProposal(proposalId);

        const payment = await this.repo.createPayment({
            userId,
            proposalId,
            amount: Number(proposal.fee),
            last4,
            brand,
            paymentMethod: dto.paymentMethod,
            cloverChargeId,
        });

        const { providerId } = proposal.message.conversation;

        // Fetch names
        const patient = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { name: true, email: true, patientProfile: { select: { name: true } } },
        });
        const doctor = await this.prisma.user.findUnique({
            where: { id: providerId },
            select: { name: true, email: true, doctorProfile: { select: { name: true } } },
        });
        const patientName = patient?.patientProfile?.name ?? patient?.name ?? "A patient";
        const doctorName = doctor?.doctorProfile?.name ?? doctor?.name ?? "a doctor";

        // Notify Doctor
        await this.notificationService.send({
            userId: providerId,
            title: "Proposal Accepted",
            message: `${patientName} has accepted your proposal.`,
            actionType: "PROPOSAL_ACCEPTED",
            referenceId: proposalId,
        });

        if (doctor?.email) {
            await this.communicationService
                .dispatch({
                    action: "PROPOSAL_ACCEPTED",
                    channel: "EMAIL",
                    to: doctor.email,
                    payload: { name: patientName },
                })
                .catch((err) => console.error("Failed to send proposal accepted email:", err));
        }

        // Notify Admins
        await this.notificationService.sendToAdmins({
            title: "Proposal Accepted",
            message: `${patientName} has accepted ${doctorName}'s proposal.`,
            actionType: "PROPOSAL_ACCEPTED",
            referenceId: proposalId,
        });

        // Email to patient
        if (patient?.email) {
            await this.communicationService
                .dispatch({
                    action: "PAYMENT_RECEIPT",
                    channel: "EMAIL",
                    to: patient.email,
                    payload: {
                        name: patientName,
                        total: Number(proposal.fee).toFixed(2),
                        transactionId: payment.transactionId,
                    },
                })
                .catch((err) =>
                    console.error("Failed to send proposal payment receipt email:", err),
                );
        }

        return {
            proposalId,
            transactionId: payment.transactionId,
            amount: payment.amount,
            status: "success",
        };
    }
}
