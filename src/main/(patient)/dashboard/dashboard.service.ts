import { Injectable } from "@nestjs/common";
import { DashboardRepository } from "./dashboard.repository";

@Injectable()
export class DashboardService {
    constructor(private readonly dashboardRepository: DashboardRepository) {}

    async getStats(userId: string) {
        const [assessmentStats, totalPayment] = await Promise.all([
            this.dashboardRepository.getAssessmentStats(userId),
            this.dashboardRepository.getTotalPayment(userId),
        ]);

        const stats = {
            TotalDraft: 0,
            TotalPending: 0,
            TotalReviewed: 0,
            TotalApproved: 0,
            TotalRefilRequested: 0,
            TotalDeclined: 0,
            TotalPayment: totalPayment,
        };

        for (const stat of assessmentStats) {
            switch (stat.status) {
                case "DRAFT":
                    stats.TotalDraft = stat._count.status;
                    break;
                case "PENDING":
                    stats.TotalPending = stat._count.status;
                    break;
                case "REVIEWED":
                    stats.TotalReviewed = stat._count.status;
                    break;
                case "ACCEPTED":
                    stats.TotalApproved = stat._count.status;
                    break;
                case "REFIL_REQUESTED":
                    stats.TotalRefilRequested = stat._count.status;
                    break;
                case "REJECTED":
                    stats.TotalDeclined = stat._count.status;
                    break;
            }
        }

        return stats;
    }
}
