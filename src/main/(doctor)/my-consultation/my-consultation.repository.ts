import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { SubmissionStatus } from "@prisma/client";
import { ConsultationTab } from "./dto/my-consultation.dto";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

@Injectable()
export class DoctorMyConsultationRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findConsultations(userId: string, tab?: ConsultationTab, page?: number, limit?: number) {
        const currentPage = page ?? DEFAULT_PAGE;
        const currentLimit = limit ?? DEFAULT_LIMIT;
        const skip = (currentPage - 1) * currentLimit;

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

        const [consultations, total, statusCounts] = await Promise.all([
            this.prisma.assessmentSubmission.findMany({
                where,
                skip,
                take: currentLimit,
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
            this.prisma.assessmentSubmission.count({ where }),
            this.prisma.assessmentSubmission.groupBy({
                by: ["status"],
                where: baseWhere,
                _count: { status: true },
            }),
        ]);

        return { consultations, total, page: currentPage, limit: currentLimit, statusCounts };
    }

    async updateConsultationStatus(
        submissionId: string,
        doctorId: string,
        status: SubmissionStatus,
        doctorNotes?: string,
    ) {
        const submission = await this.prisma.assessmentSubmission.findUnique({
            where: { id: submissionId },
            select: { id: true, userId: true, doctorNotes: true },
        });

        if (!submission) {
            throw new Error("Submission not found");
        }

        // Update AssessmentSubmission status, notes, reviewer
        await this.prisma.assessmentSubmission.update({
            where: { id: submissionId },
            data: {
                status,
                doctorNotes: doctorNotes ?? submission.doctorNotes,
                reviewedBy: doctorId,
                reviewedAt: new Date(),
            },
        });

        return submission;
    }
}

