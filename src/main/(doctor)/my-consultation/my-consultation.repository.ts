import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { SubmissionStatus } from "@prisma/client";
import { ConsultationTab } from "./dto/my-consultation.dto";

@Injectable()
export class DoctorMyConsultationRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findConsultations(userId: string, tab?: ConsultationTab) {
        const baseWhere: Prisma.AssessmentSubmissionWhereInput = {
            OR: [
                { reviewedBy: userId },
                { status: SubmissionStatus.PENDING },
            ],
        };

        const statusMap: Record<ConsultationTab, SubmissionStatus[] | undefined> = {
            [ConsultationTab.ACTIVE_CONSULTATION]: [SubmissionStatus.ACCEPTED],
            [ConsultationTab.NEW_REQUEST]: [SubmissionStatus.PENDING, SubmissionStatus.REFIL_REQUESTED, SubmissionStatus.REVIEWED],
            [ConsultationTab.DECLINED_REQUEST]: [SubmissionStatus.REJECTED],
            [ConsultationTab.HISTORY]: undefined, // returning all for history
        };

        const where: Prisma.AssessmentSubmissionWhereInput = { ...baseWhere };

        if (tab && statusMap[tab]) {
            where.status = { in: statusMap[tab] };
        }

        const [consultations, statusCounts] = await Promise.all([
            this.prisma.assessmentSubmission.findMany({
                where,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    status: true,
                    assessment: {
                        select: {
                            title: true,
                            thumbnail: true,
                            category: { select: { name: true } },
                        },
                    },
                    user: {
                        select: {
                            name: true,
                            patientProfile: { select: { name: true } },
                        },
                    },
                },
            }),
            this.prisma.assessmentSubmission.groupBy({
                by: ["status"],
                where: baseWhere,
                _count: { status: true },
            }),
        ]);

        return { consultations, statusCounts };
    }

    async updateConsultationStatus(
        submissionId: string,
        doctorId: string,
        status: SubmissionStatus,
        doctorNotes?: string,
    ) {
        return this.prisma.$transaction(async (tx) => {
            const submission = await tx.assessmentSubmission.findUnique({
                where: { id: submissionId },
                include: { orders: { include: { payments: true } } },
            });

            if (!submission) {
                throw new Error("Submission not found");
            }

            // Update AssessmentSubmission
            await tx.assessmentSubmission.update({
                where: { id: submissionId },
                data: {
                    status,
                    doctorNotes: doctorNotes ?? submission.doctorNotes,
                    reviewedBy: doctorId,
                    reviewedAt: new Date(),
                },
            });

            // If rejected, handle refunds
            if (status === SubmissionStatus.REJECTED) {
                for (const order of submission.orders) {
                    if (order.status !== "CANCELLED" && order.status !== "REFUNDED") {
                        await tx.order.update({
                            where: { id: order.id },
                            data: {
                                status: "CANCELLED",
                                cancelledAt: new Date(),
                                cancelReason: "Doctor rejected consultation",
                            },
                        });
                    }

                    for (const payment of order.payments) {
                        if (payment.status === "COMPLETED") {
                            await tx.payment.update({
                                where: { id: payment.id },
                                data: {
                                    status: "REFUNDED",
                                },
                            });
                        }
                    }
                }
            }

            return submission;
        });
    }
}
