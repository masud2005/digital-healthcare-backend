import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class DashboardRepository {
    constructor(private readonly prisma: PrismaService) {}

    async getAssessmentStats(userId: string) {
        return this.prisma.assessmentSubmission.groupBy({
            by: ["status"],
            where: { userId },
            _count: {
                status: true,
            },
        });
    }

    async getTotalPayment(userId: string) {
        const result = await this.prisma.payment.aggregate({
            where: {
                userId,
                status: "COMPLETED",
            },
            _sum: {
                amount: true,
            },
        });

        return result._sum.amount ? Number(result._sum.amount) : 0;
    }
}
