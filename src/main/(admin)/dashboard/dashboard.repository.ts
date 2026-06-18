import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { SubmissionStatus } from "@prisma/client";

@Injectable()
export class DashboardRepository {
    constructor(private readonly prisma: PrismaService) {}

    async getStats() {
        const [totalPatients, totalDoctors, activeCategories, totalAssessmentSubmissions] =
            await this.prisma.$transaction([
                this.prisma.user.count({
                    where: {
                        deletedAt: null,
                        userRoles: { some: { role: { name: "PATIENT" } } },
                    },
                }),
                this.prisma.doctorProfile.count({
                    where: { deletedAt: null },
                }),
                this.prisma.category.count({
                    where: { status: "ACTIVE" },
                }),
                this.prisma.assessmentSubmission.count({
                    where: { status: { not: SubmissionStatus.DRAFT } },
                }),
            ]);

        return { totalPatients, totalDoctors, activeCategories, totalAssessmentSubmissions };
    }

    getRecentAssessments() {
        return this.prisma.assessmentSubmission.findMany({
            where: { status: { not: "DRAFT" } },
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    include: {
                        patientProfile: {
                            select: { name: true, avatar: { select: { fileUrl: true } } },
                        },
                    },
                },
                assessment: {
                    select: {
                        id: true,
                        title: true,
                        category: { select: { id: true, name: true } },
                    },
                },
            },
        });
    }

    findDoctorByUserId(userId: string) {
        return this.prisma.doctorProfile.findFirst({
            where: { userId, deletedAt: null },
            select: { id: true, name: true },
        });
    }

    countSubmissionsByUserId(userId: string) {
        return this.prisma.assessmentSubmission.count({
            where: { userId, status: { not: "DRAFT" } },
        });
    }
}
