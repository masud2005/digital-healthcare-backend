import { StorageService } from "@global/storage/storage.service";
import { Injectable } from "@nestjs/common";
import { DashboardRepository } from "./dashboard.repository";

@Injectable()
export class DashboardService {
    constructor(
        private readonly dashboardRepository: DashboardRepository,
        private readonly storageService: StorageService,
    ) {}

    async getStats() {
        const stats = await this.dashboardRepository.getStats();
        return {
            success: true,
            statusCode: 200,
            message: "Dashboard stats fetched successfully",
            data: stats,
        };
    }

    async getRecentActivity() {
        const submissions = await this.dashboardRepository.getRecentAssessments();

        const data = await Promise.all(
            submissions.map(async (submission) => {
                const [totalSubmissions, provider] = await Promise.all([
                    this.dashboardRepository.countSubmissionsByUserId(submission.userId),
                    submission.reviewedBy
                        ? this.dashboardRepository.findDoctorByUserId(submission.reviewedBy)
                        : Promise.resolve(null),
                ]);

                return {
                    submissionId: submission.id,
                    submissionCode: submission.submissionCode,
                    patientName: submission.user.patientProfile?.name ?? null,
                    patientImage: submission.user.patientProfile?.avatar?.fileUrl
                        ? await this.storageService.resolveKey(
                              submission.user.patientProfile.avatar.fileUrl,
                          )
                        : null,
                    patientId: submission.user.id,
                    provider: provider?.name ?? null,
                    patientType: totalSubmissions <= 1 ? "New Patient" : "Repeat Patient",
                    categoryName: submission.assessment.category.name,
                    status: submission.status,
                    date: submission.createdAt,
                };
            }),
        );

        return {
            success: true,
            statusCode: 200,
            message: "Recent activity fetched successfully",
            data,
        };
    }
}
