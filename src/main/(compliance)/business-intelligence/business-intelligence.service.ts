import { Injectable } from "@nestjs/common";
import { TrendFilter } from "./dto/bi-query.dto";
import { BusinessIntelligenceRepository } from "./business-intelligence.repository";

type TrendPoint = { label: string; revenue?: number; refund?: number; count?: number };

@Injectable()
export class BusinessIntelligenceService {
    constructor(private readonly repo: BusinessIntelligenceRepository) {}

    // ── /stats ─────────────────────────────────────────────────────────────────

    async getStats() {
        const [
            revenueAgg,
            refundAgg,
            newPatients,
            activePatients,
            submissionCounts,
            cancelledSubs,
            ltvGroups,
        ] = await Promise.all([
            this.repo.getTotalRevenue(),
            this.repo.getTotalRefund(),
            this.repo.getNewPatientsCount(),
            this.repo.getActivePatientsCount(),
            this.repo.getSubmissionStatusCounts(),
            this.repo.getCancelledSubscriptionRevenue(),
            this.repo.getAvgLTV(),
        ]);

        const totalRevenue = Number(revenueAgg._sum.amount ?? 0);
        const totalRefund = Number(refundAgg._sum.amount ?? 0);

        const accepted = submissionCounts.find((s) => s.status === "ACCEPTED")?._count.id ?? 0;
        const rejected = submissionCounts.find((s) => s.status === "REJECTED")?._count.id ?? 0;
        const total = accepted + rejected;
        const approvalRate = total > 0 ? +((accepted / total) * 100).toFixed(2) : 0;
        const denialRate = total > 0 ? +((rejected / total) * 100).toFixed(2) : 0;

        const subscriptionChurn = cancelledSubs.reduce(
            (sum, sub) => sum + sub.payments.reduce((s, p) => s + Number(p.amount), 0),
            0,
        );

        const avgLTV =
            ltvGroups.length > 0
                ? +(
                      ltvGroups.reduce((sum, g) => sum + Number(g._sum.amount ?? 0), 0) /
                      ltvGroups.length
                  ).toFixed(2)
                : 0;

        return {
            totalRevenue,
            totalRefund,
            newPatients,
            activePatients,
            approvalRate,
            denialRate,
            subscriptionChurn: +subscriptionChurn.toFixed(2),
            avgLTV,
        };
    }

    // ── /category-revenue ──────────────────────────────────────────────────────

    async getCategoryRevenue() {
        const subscriptions = await this.repo.getCategoryRevenue();

        const map = new Map<string, { name: string; totalAmount: number }>();

        for (const sub of subscriptions) {
            const key = sub.category.id;
            const amount = sub.payments.reduce((s, p) => s + Number(p.amount), 0);
            const existing = map.get(key);
            if (existing) {
                existing.totalAmount += amount;
            } else {
                map.set(key, { name: sub.category.name, totalAmount: amount });
            }
        }

        const entries = Array.from(map.values());
        const grandTotal = entries.reduce((s, e) => s + e.totalAmount, 0);

        return entries.map((e) => ({
            categoryName: e.name,
            totalAmount: +e.totalAmount.toFixed(2),
            percentage: grandTotal > 0 ? +((e.totalAmount / grandTotal) * 100).toFixed(2) : 0,
        }));
    }

    // ── /revenue-vs-refund ─────────────────────────────────────────────────────

    async getRevenueVsRefund(filter: TrendFilter) {
        const { gte, lte, labels, getLabel } = this.buildTrendConfig(filter);

        const [revenues, refunds] = await Promise.all([
            this.repo.getRevenueInRange(gte, lte),
            this.repo.getRefundInRange(gte, lte),
        ]);

        const revenueMap = new Map<string, number>();
        const refundMap = new Map<string, number>();

        for (const r of revenues) {
            const key = getLabel(new Date(r.createdAt));
            revenueMap.set(key, (revenueMap.get(key) ?? 0) + Number(r.amount));
        }

        for (const r of refunds) {
            const key = getLabel(new Date(r.createdAt));
            refundMap.set(key, (refundMap.get(key) ?? 0) + Number(r.amount));
        }

        return labels.map<TrendPoint>((label) => ({
            label,
            revenue: +(revenueMap.get(label) ?? 0).toFixed(2),
            refund: +(refundMap.get(label) ?? 0).toFixed(2),
        }));
    }

    // ── /patient-growth ────────────────────────────────────────────────────────

    async getPatientGrowth(filter: TrendFilter) {
        const { gte, lte, labels, getLabel } = this.buildTrendConfig(filter);

        const patients = await this.repo.getPatientRegistrationsInRange(gte, lte);

        const countMap = new Map<string, number>();
        for (const p of patients) {
            const key = getLabel(new Date(p.createdAt));
            countMap.set(key, (countMap.get(key) ?? 0) + 1);
        }

        return labels.map<TrendPoint>((label) => ({
            label,
            count: countMap.get(label) ?? 0,
        }));
    }

    // ── /approval-vs-denial ────────────────────────────────────────────────────

    async getApprovalVsDenial() {
        const counts = await this.repo.getApprovalDenialCounts();

        const approved = counts.find((s) => s.status === "ACCEPTED")?._count.id ?? 0;
        const rejected = counts.find((s) => s.status === "REJECTED")?._count.id ?? 0;
        const total = approved + rejected;

        return {
            approved,
            rejected,
            approvedPercentage: total > 0 ? +((approved / total) * 100).toFixed(2) : 0,
            rejectedPercentage: total > 0 ? +((rejected / total) * 100).toFixed(2) : 0,
        };
    }

    // ── /revenue-by-service ────────────────────────────────────────────────────

    async getRevenueByService() {
        // same data as category-revenue, different shape
        return this.getCategoryRevenue();
    }

    // ── trend helpers ──────────────────────────────────────────────────────────

    private buildTrendConfig(filter: TrendFilter) {
        const now = new Date();
        const lte = new Date(now);
        let gte: Date;
        let labels: string[];
        let getLabel: (d: Date) => string;

        if (filter === TrendFilter.LAST_7_DAYS) {
            gte = new Date(now);
            gte.setDate(now.getDate() - 6);
            gte.setHours(0, 0, 0, 0);

            const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            labels = Array.from({ length: 7 }, (_, i) => {
                const d = new Date(gte);
                d.setDate(gte.getDate() + i);
                return days[d.getDay()];
            });
            getLabel = (d: Date) => days[d.getDay()];
        } else if (filter === TrendFilter.LAST_MONTH) {
            gte = new Date(now);
            gte.setMonth(now.getMonth() - 1);
            gte.setHours(0, 0, 0, 0);

            // Day 5, Day 10, Day 15, Day 20, Day 25, Day 30
            labels = [5, 10, 15, 20, 25, 30].map((d) => `Day ${d}`);
            getLabel = (d: Date) => {
                const day = d.getDate();
                if (day <= 5) return "Day 5";
                if (day <= 10) return "Day 10";
                if (day <= 15) return "Day 15";
                if (day <= 20) return "Day 20";
                if (day <= 25) return "Day 25";
                return "Day 30";
            };
        } else {
            // LAST_YEAR
            gte = new Date(now);
            gte.setFullYear(now.getFullYear() - 1);
            gte.setHours(0, 0, 0, 0);

            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            labels = months;
            getLabel = (d: Date) => months[d.getMonth()];
        }

        return { gte, lte, labels, getLabel };
    }
}
