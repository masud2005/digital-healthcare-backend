import { StorageService } from "@global/storage/storage.service";
import { CloverService } from "@global/clover/clover.service";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { SubmissionStatus } from "@prisma/client";
import { ConsultationTab, UpdateConsultationStatusDto } from "./dto/my-consultation.dto";
import { DoctorMyConsultationRepository } from "./my-consultation.repository";
import { NotificationService } from "../../notification/notification.service";
import { PrismaService } from "@global/prisma/prisma.service";

@Injectable()
export class DoctorMyConsultationService {
    private readonly logger = new Logger(DoctorMyConsultationService.name);

    constructor(
        private readonly myConsultationRepository: DoctorMyConsultationRepository,
        private readonly storageService: StorageService,
        private readonly notificationService: NotificationService,
        private readonly prisma: PrismaService,
        private readonly cloverService: CloverService,
    ) {}

    async getMyConsultations(userId: string, tab?: ConsultationTab, page?: number, limit?: number) {
        const { consultations, total, page: currentPage, limit: currentLimit, statusCounts } =
            await this.myConsultationRepository.findConsultations(userId, tab, page, limit);

        const mappedConsultations = await Promise.all(
            consultations.map(async (consultation) => ({
                id: consultation.id,
                category: consultation.assessment.category?.name ?? null,
                title: consultation.assessment.title,
                patientName: consultation.user.patientProfile?.name ?? consultation.user.name ?? null,
                thumbnail: consultation.assessment.thumbnail
                    ? await this.storageService.resolveKey(consultation.assessment.thumbnail)
                    : null,
                status: consultation.status,
            })),
        );

        let activeCount = 0;
        let newCount = 0;
        let declinedCount = 0;

        for (const count of statusCounts) {
            switch (count.status) {
                case "ACCEPTED":
                    activeCount += count._count.status;
                    break;
                case "PENDING":
                case "REFIL_REQUESTED":
                case "REVIEWED":
                    newCount += count._count.status;
                    break;
                case "REJECTED":
                    declinedCount += count._count.status;
                    break;
            }
        }

        const counts = {
            [ConsultationTab.ACTIVE_CONSULTATION]: activeCount,
            [ConsultationTab.NEW_REQUEST]: newCount,
            [ConsultationTab.DECLINED_REQUEST]: declinedCount,
            [ConsultationTab.HISTORY]: activeCount + newCount + declinedCount,
        };

        return {
            consultations: mappedConsultations,
            counts,
            meta: {
                page: currentPage,
                limit: currentLimit,
                total,
                totalPages: Math.ceil(total / currentLimit),
            },
        };
    }

    async updateStatus(submissionId: string, doctorId: string, dto: UpdateConsultationStatusDto) {
        const { status, doctorNotes } = dto;

        // Ensure status is valid
        if (!Object.values(SubmissionStatus).includes(status as SubmissionStatus)) {
            throw new BadRequestException("Invalid status");
        }

        if (
            (status === SubmissionStatus.REJECTED || status === SubmissionStatus.REFIL_REQUESTED) &&
            (!doctorNotes || doctorNotes.trim().length === 0)
        ) {
            throw new BadRequestException("Doctor notes are mandatory when rejecting or requesting a refill.");
        }

        const result = await this.myConsultationRepository.updateConsultationStatus(
            submissionId,
            doctorId,
            status as SubmissionStatus,
            doctorNotes,
        );

        // Fetch names
        const patient = await this.prisma.user.findUnique({
            where: { id: result.userId },
            select: { name: true, patientProfile: { select: { name: true } } },
        });
        const doctor = await this.prisma.user.findUnique({
            where: { id: doctorId },
            select: { name: true, doctorProfile: { select: { name: true } } },
        });
        const patientName = patient?.patientProfile?.name ?? patient?.name ?? "A patient";
        const doctorName = doctor?.doctorProfile?.name ?? doctor?.name ?? "A doctor";

        // ── AUTO REFUND on REJECTED ──────────────────────────────────────────────
        if (status === SubmissionStatus.REJECTED) {
            // Fetch all completed payments tied to orders of this submission
            const payments = await this.prisma.payment.findMany({
                where: {
                    order: { submissionId },
                    status: "COMPLETED",
                },
                select: {
                    id: true,
                    transactionId: true,
                    amount: true,
                    userId: true,
                },
            });

            for (const payment of payments) {
                const refundNumber = `REF-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
                let gatewayRefundId: string | null = null;

                // Call Clover refund API
                try {
                    gatewayRefundId = await this.cloverService.refundCharge(
                        payment.transactionId,
                        Number(payment.amount),
                    );
                } catch (err) {
                    this.logger.error(`Clover refund failed for payment ${payment.id}`, err);
                    // Continue — still mark as refunded in DB and create record
                }

                // Create Refund record in DB
                await this.prisma.refund.create({
                    data: {
                        refundNumber,
                        amount: payment.amount,
                        reason: `Doctor rejected consultation. Automatic full refund issued.`,
                        status: gatewayRefundId ? "COMPLETED" : "PENDING",
                        gatewayRefundId,
                        paymentId: payment.id,
                        userId: payment.userId,
                    },
                });

                // Mark payment as REFUNDED
                await this.prisma.payment.update({
                    where: { id: payment.id },
                    data: { status: "REFUNDED", refundedAt: new Date() },
                });
            }

            // Notify patient about refund
            await this.notificationService.send({
                userId: result.userId,
                title: "Refund Initiated",
                message: `Your payment has been refunded because ${doctorName} has declined your consultation. The amount will be credited to your account shortly.`,
                actionType: "PAYMENT_SUCCESS",
                referenceId: submissionId,
            });
        }
        // ─────────────────────────────────────────────────────────────────────────

        // Notify Patient about status update
        await this.notificationService.send({
            userId: result.userId,
            title: "Assessment Status Updated",
            message: `${doctorName} has updated your assessment status to ${status}.`,
            actionType: "ASSESSMENT_STATUS_UPDATED",
            referenceId: submissionId,
        });

        // Notify Admins
        await this.notificationService.sendToAdmins({
            title: "Assessment Status Updated",
            message: `${doctorName} has updated the assessment status of ${patientName} to ${status}.`,
            actionType: "ASSESSMENT_STATUS_UPDATED",
            referenceId: submissionId,
        });

        return result;
    }
}
