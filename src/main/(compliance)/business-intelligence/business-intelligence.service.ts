import { Injectable, NotFoundException } from "@nestjs/common";
import { TrendFilter, DropOffQueryDto } from "./dto/bi-query.dto";
import { BusinessIntelligenceRepository } from "./business-intelligence.repository";
import { StorageService } from "@global/storage/storage.service";

type TrendPoint = { label: string; revenue?: number; refund?: number; count?: number };

@Injectable()
export class BusinessIntelligenceService {
    constructor(
        private readonly repo: BusinessIntelligenceRepository,
        private readonly storageService: StorageService
    ) {}

    // ── /stats ─────────────────────────────────────────────────────────────────

    async getStats(filter: TrendFilter) {
        const { gte, lte } = this.getDateRange(filter);
        
        const [
            revenueAgg,
            refundAgg,
            newPatients,
            activePatients,
            submissionCounts,
            cancelledSubs,
            ltvGroups,
            turnaroundMs,
        ] = await Promise.all([
            this.repo.getTotalRevenue(gte, lte),
            this.repo.getTotalRefund(gte, lte),
            this.repo.getNewPatientsCount(gte, lte),
            this.repo.getActivePatientsCount(gte, lte),
            this.repo.getSubmissionStatusCounts(gte, lte),
            this.repo.getCancelledSubscriptionRevenue(gte, lte),
            this.repo.getAvgLTV(gte, lte),
            this.repo.getProviderTurnaround(gte, lte),
        ]);

        const totalRevenue = Number(revenueAgg._sum.amount ?? 0);
        const totalRefund = Number(refundAgg._sum.amount ?? 0);

        const accepted = submissionCounts.find((s) => s.status === "ACCEPTED")?._count.id ?? 0;
        const rejected = submissionCounts.find((s) => s.status === "REJECTED")?._count.id ?? 0;
        const refillRequested = submissionCounts.find((s) => s.status === "REFIL_REQUESTED")?._count.id ?? 0;
        const intakeDropOff = submissionCounts.find((s) => s.status === "DRAFT")?._count.id ?? 0;

        const totalApprovalBase = accepted + rejected;
        const approvalRate = totalApprovalBase > 0 ? +((accepted / totalApprovalBase) * 100).toFixed(2) : 0;
        const denialRate = totalApprovalBase > 0 ? +((rejected / totalApprovalBase) * 100).toFixed(2) : 0;

        const pending = submissionCounts.find((s) => s.status === "PENDING")?._count.id ?? 0;
        const reviewed = submissionCounts.find((s) => s.status === "REVIEWED")?._count.id ?? 0;
        const totalSubmitted = accepted + rejected + refillRequested + pending + reviewed;
        const refillRate = totalSubmitted > 0 ? +((refillRequested / totalSubmitted) * 100).toFixed(2) : 0;

        let providerTurnaround = "N/A";
        if (turnaroundMs > 0) {
            const hours = Math.round(turnaroundMs / (1000 * 60 * 60));
            if (hours > 0) {
                providerTurnaround = `${hours} h/avg.`;
            } else {
                const mins = Math.round(turnaroundMs / (1000 * 60));
                providerTurnaround = `${mins} m/avg.`;
            }
        }

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
            refillRate,
            intakeDropOff,
            providerTurnaround,
            subscriptionChurn: +subscriptionChurn.toFixed(2),
            avgLTV,
        };
    }

    // ── /category-revenue ──────────────────────────────────────────────────────

    async getCategoryRevenue(filter?: TrendFilter) {
        const { gte, lte } = this.getDateRange(filter);
        const subscriptions = await this.repo.getCategoryRevenue(gte, lte);

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

    async getApprovalVsDenial(filter: TrendFilter) {
        const { gte, lte } = this.getDateRange(filter);
        const counts = await this.repo.getApprovalDenialCounts(gte, lte);

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

    private getDateRange(filter?: TrendFilter) {
        if (!filter) return { gte: undefined, lte: undefined };

        const now = new Date();
        const lte = new Date(now);
        let gte: Date;

        if (filter === TrendFilter.TODAY) {
            gte = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        } else if (filter === TrendFilter.LAST_7_DAYS) {
            gte = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        } else if (filter === TrendFilter.LAST_MONTH) {
            gte = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        } else {
            // LAST_YEAR
            gte = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        }

        return { gte, lte };
    }

    private buildTrendConfig(filter: TrendFilter) {
        const now = new Date();
        const lte = new Date(now);
        let gte: Date;
        let labels: string[];
        let getLabel: (d: Date) => string;

        if (filter === TrendFilter.TODAY) {
            gte = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            labels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
            getLabel = (d: Date) => `${d.getHours().toString().padStart(2, '0')}:00`;
        } else if (filter === TrendFilter.LAST_7_DAYS) {
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

            const months = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ];
            labels = months;
            getLabel = (d: Date) => months[d.getMonth()];
        }

        return { gte, lte, labels, getLabel };
    }

    // ── /drop-off ──────────────────────────────────────────────────────────────

    async getDropOffs(query: DropOffQueryDto) {
        const { data, total, page, limit } = await this.repo.findDropOffs(query);

        const items = await Promise.all(
            data.map(async (submission) => {
                const user = submission.user;
                const activeSubmissionsCount = user.assessmentSubmissions.length;
                const patientType = activeSubmissionsCount > 0 ? "Repeat Patient" : "New Patient";
                
                return {
                    id: submission.id,
                    userName: user.patientProfile?.name ?? user.name ?? "Unknown",
                    userImage: user.patientProfile?.avatar?.fileUrl
                        ? await this.storageService.resolveKey(user.patientProfile.avatar.fileUrl)
                        : null,
                    email: user.email,
                    assessmentName: submission.assessment.title ?? submission.assessment.category?.name ?? "Unknown",
                    userType: patientType,
                    status: "Drop-Off",
                    ipAddress: user.authDevices?.[0]?.ipLastSeen ?? "Unknown",
                    timeStamp: submission.createdAt,
                };
            })
        );

        return {
            data: items,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }

    async getDropOffById(id: string) {
        const submission = await this.repo.findDropOffById(id);
        if (!submission) {
            throw new NotFoundException("Drop-off not found");
        }

        const user = submission.user;
        const activeSubmissionsCount = user.assessmentSubmissions.length;
        const patientType = activeSubmissionsCount > 0 ? "Repeat Patient" : "New Patient";

        return {
            id: submission.id,
            userName: user.patientProfile?.name ?? user.name ?? "Unknown",
            userImage: user.patientProfile?.avatar?.fileUrl
                ? await this.storageService.resolveKey(user.patientProfile.avatar.fileUrl)
                : null,
            email: user.email,
            assessmentName: submission.assessment.title ?? submission.assessment.category?.name ?? "Unknown",
            userType: patientType,
            status: "Drop-Off",
            ipAddress: user.authDevices?.[0]?.ipLastSeen ?? "Unknown",
            timeStamp: submission.createdAt,
        };
    }

    async deleteDropOff(id: string) {
        const submission = await this.repo.findDropOffById(id);
        if (!submission) {
            throw new NotFoundException("Drop-off not found");
        }
        await this.repo.deleteDropOff(id);
        return { message: "Drop-off deleted successfully" };
    }
}
