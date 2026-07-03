import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { PaymentStatus, SubmissionStatus } from "@prisma/client";
import { TrendFilter, DropOffQueryDto } from "./dto/bi-query.dto";

@Injectable()
export class BusinessIntelligenceRepository {
    constructor(private readonly prisma: PrismaService) {}

    // ── /stats ─────────────────────────────────────────────────────────────────

    getTotalRevenue(gte?: Date, lte?: Date) {
        return this.prisma.payment.aggregate({
            where: {
                status: PaymentStatus.COMPLETED,
                ...(gte && lte ? { createdAt: { gte, lte } } : {}),
            },
            _sum: { amount: true },
        });
    }

    getTotalRefund(gte?: Date, lte?: Date) {
        return this.prisma.refund.aggregate({
            where: { ...(gte && lte ? { createdAt: { gte, lte } } : {}) },
            _sum: { amount: true },
        });
    }

    getNewPatientsCount(gte?: Date, lte?: Date) {
        return this.prisma.user.count({
            where: {
                deletedAt: null,
                userRoles: { some: { role: { name: "PATIENT" } } },
                ...(gte && lte
                    ? { createdAt: { gte, lte } }
                    : { createdAt: { gte: this.startOfCurrentMonth() } }),
            },
        });
    }

    getActivePatientsCount(gte?: Date, lte?: Date) {
        return this.prisma.user.count({
            where: {
                deletedAt: null,
                status: "ACTIVE",
                userRoles: { some: { role: { name: "PATIENT" } } },
                ...(gte && lte ? { createdAt: { gte, lte } } : {}),
            },
        });
    }

    getSubmissionStatusCounts(gte?: Date, lte?: Date) {
        return this.prisma.assessmentSubmission.groupBy({
            by: ["status"],
            where: { ...(gte && lte ? { createdAt: { gte, lte } } : {}) },
            _count: { id: true },
        });
    }

    getCancelledSubscriptionRevenue(gte?: Date, lte?: Date) {
        return this.prisma.subscription.findMany({
            where: { status: "CANCELLED", ...(gte && lte ? { updatedAt: { gte, lte } } : {}) },
            include: {
                payments: {
                    where: { status: PaymentStatus.COMPLETED },
                    select: { amount: true },
                },
            },
        });
    }

    getAvgLTV(gte?: Date, lte?: Date) {
        // Average total completed payment amount per unique user
        return this.prisma.payment.groupBy({
            by: ["userId"],
            where: {
                status: PaymentStatus.COMPLETED,
                ...(gte && lte ? { createdAt: { gte, lte } } : {}),
            },
            _sum: { amount: true },
        });
    }

    // ── /category-revenue & /revenue-by-service ────────────────────────────────

    getCategoryRevenue(gte?: Date, lte?: Date) {
        return this.prisma.subscription.findMany({
            where: {
                payments: { some: { status: PaymentStatus.COMPLETED } },
                ...(gte && lte ? { createdAt: { gte, lte } } : {}),
            },
            include: {
                category: { select: { id: true, name: true } },
                payments: {
                    where: {
                        status: PaymentStatus.COMPLETED,
                        ...(gte && lte ? { createdAt: { gte, lte } } : {}),
                    },
                    select: { amount: true },
                },
            },
        });
    }

    // ── /revenue-vs-refund ─────────────────────────────────────────────────────

    getRevenueInRange(gte: Date, lte: Date) {
        return this.prisma.payment.findMany({
            where: { status: PaymentStatus.COMPLETED, createdAt: { gte, lte } },
            select: { amount: true, createdAt: true },
        });
    }

    getRefundInRange(gte: Date, lte: Date) {
        return this.prisma.refund.findMany({
            where: { createdAt: { gte, lte } },
            select: { amount: true, createdAt: true },
        });
    }

    // ── /patient-growth ────────────────────────────────────────────────────────

    getPatientRegistrationsInRange(gte: Date, lte: Date) {
        return this.prisma.user.findMany({
            where: {
                deletedAt: null,
                userRoles: { some: { role: { name: "PATIENT" } } },
                createdAt: { gte, lte },
            },
            select: { createdAt: true },
        });
    }

    async getProviderTurnaround(gte?: Date, lte?: Date) {
        const submissions = await this.prisma.assessmentSubmission.findMany({
            where: {
                reviewedAt: { not: null },
                ...(gte && lte ? { createdAt: { gte, lte } } : {}),
            },
            select: { createdAt: true, reviewedAt: true },
        });

        if (submissions.length === 0) return 0;

        let totalMs = 0;
        for (const sub of submissions) {
            if (sub.reviewedAt) {
                totalMs += sub.reviewedAt.getTime() - sub.createdAt.getTime();
            }
        }
        return totalMs / submissions.length;
    }

    // ── /approval-vs-denial ────────────────────────────────────────────────────

    getApprovalDenialCounts(gte?: Date, lte?: Date) {
        return this.prisma.assessmentSubmission.groupBy({
            by: ["status"],
            where: {
                status: { in: [SubmissionStatus.ACCEPTED, SubmissionStatus.REJECTED] },
                ...(gte && lte ? { createdAt: { gte, lte } } : {}),
            },
            _count: { id: true },
        });
    }

    // ─── helpers ───────────────────────────────────────────────────────────────

    private startOfCurrentMonth() {
        const d = new Date();
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    // ── /drop-off ──────────────────────────────────────────────────────────────

    async findDropOffs(query: DropOffQueryDto) {
        const page = Number(query.page ?? 1);
        const limit = Number(query.limit ?? 10);
        const skip = (page - 1) * limit;

        const where: any = {
            status: SubmissionStatus.DRAFT,
        };

        if (query.categoryId) {
            where.assessment = { categoryId: query.categoryId };
        }

        if (query.search) {
            where.OR = [
                { user: { name: { contains: query.search, mode: "insensitive" } } },
                {
                    user: {
                        patientProfile: { name: { contains: query.search, mode: "insensitive" } },
                    },
                },
                { user: { email: { contains: query.search, mode: "insensitive" } } },
            ];
        }

        if (query.date) {
            const now = new Date();
            let gte: Date | undefined;
            if (query.date === TrendFilter.TODAY) {
                gte = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            } else if (query.date === TrendFilter.LAST_7_DAYS) {
                gte = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
            } else if (query.date === TrendFilter.LAST_MONTH) {
                gte = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            } else if (query.date === TrendFilter.LAST_YEAR) {
                gte = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            }
            if (gte) {
                where.createdAt = { gte };
            }
        }

        if (query.patientType) {
            const userFilter =
                query.patientType === "New Patient"
                    ? {
                          assessmentSubmissions: {
                              none: { status: { not: SubmissionStatus.DRAFT } },
                          },
                      }
                    : {
                          assessmentSubmissions: {
                              some: { status: { not: SubmissionStatus.DRAFT } },
                          },
                      };

            where.user = { ...where.user, ...userFilter };
        }

        const [data, total] = await this.prisma.$transaction([
            this.prisma.assessmentSubmission.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            patientProfile: {
                                select: { name: true, avatar: { select: { fileUrl: true } } },
                            },
                            authDevices: {
                                orderBy: { lastSeenAt: "desc" },
                                take: 1,
                                select: { ipLastSeen: true },
                            },
                            assessmentSubmissions: {
                                where: { status: { not: SubmissionStatus.DRAFT } },
                                select: { id: true },
                            },
                        },
                    },
                    assessment: {
                        select: { title: true, category: { select: { name: true } } },
                    },
                },
            }),
            this.prisma.assessmentSubmission.count({ where }),
        ]);

        return { data, total, page, limit };
    }

    findDropOffById(id: string) {
        return this.prisma.assessmentSubmission.findUnique({
            where: { id, status: SubmissionStatus.DRAFT },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        patientProfile: {
                            select: { name: true, avatar: { select: { fileUrl: true } } },
                        },
                        authDevices: {
                            orderBy: { lastSeenAt: "desc" },
                            take: 1,
                            select: { ipLastSeen: true },
                        },
                        assessmentSubmissions: {
                            where: { status: { not: SubmissionStatus.DRAFT } },
                            select: { id: true },
                        },
                    },
                },
                assessment: {
                    select: { title: true, category: { select: { name: true } } },
                },
            },
        });
    }

    deleteDropOff(id: string) {
        return this.prisma.assessmentSubmission.delete({
            where: { id },
        });
    }
}
