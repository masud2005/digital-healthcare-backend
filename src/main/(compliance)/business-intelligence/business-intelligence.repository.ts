import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { PaymentStatus, SubmissionStatus } from "@prisma/client";

@Injectable()
export class BusinessIntelligenceRepository {
    constructor(private readonly prisma: PrismaService) {}

    // ── /stats ─────────────────────────────────────────────────────────────────

    getTotalRevenue() {
        return this.prisma.payment.aggregate({
            where: { status: PaymentStatus.COMPLETED },
            _sum: { amount: true },
        });
    }

    getTotalRefund() {
        return this.prisma.refund.aggregate({
            _sum: { amount: true },
        });
    }

    getNewPatientsCount() {
        return this.prisma.user.count({
            where: {
                deletedAt: null,
                userRoles: { some: { role: { name: "PATIENT" } } },
                createdAt: { gte: this.startOfCurrentMonth() },
            },
        });
    }

    getActivePatientsCount() {
        return this.prisma.user.count({
            where: {
                deletedAt: null,
                status: "ACTIVE",
                userRoles: { some: { role: { name: "PATIENT" } } },
            },
        });
    }

    getSubmissionStatusCounts() {
        return this.prisma.assessmentSubmission.groupBy({
            by: ["status"],
            where: { status: { in: [SubmissionStatus.ACCEPTED, SubmissionStatus.REJECTED] } },
            _count: { id: true },
        });
    }

    getCancelledSubscriptionRevenue() {
        return this.prisma.subscription.findMany({
            where: { status: "CANCELLED" },
            include: {
                payments: {
                    where: { status: PaymentStatus.COMPLETED },
                    select: { amount: true },
                },
            },
        });
    }

    getAvgLTV() {
        // Average total completed payment amount per unique user
        return this.prisma.payment.groupBy({
            by: ["userId"],
            where: { status: PaymentStatus.COMPLETED },
            _sum: { amount: true },
        });
    }

    // ── /category-revenue & /revenue-by-service ────────────────────────────────

    getCategoryRevenue() {
        return this.prisma.subscription.findMany({
            where: {
                payments: { some: { status: PaymentStatus.COMPLETED } },
            },
            include: {
                category: { select: { id: true, name: true } },
                payments: {
                    where: { status: PaymentStatus.COMPLETED },
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

    // ── /approval-vs-denial ────────────────────────────────────────────────────

    getApprovalDenialCounts() {
        return this.prisma.assessmentSubmission.groupBy({
            by: ["status"],
            where: { status: { in: [SubmissionStatus.ACCEPTED, SubmissionStatus.REJECTED] } },
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
}
