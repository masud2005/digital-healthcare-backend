import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class DoctorDashboardRepository {
    constructor(private readonly prisma: PrismaService) {}

    async getStats(userId: string) {
        // Group by status where the submission is either assigned to this doctor or is unassigned (PENDING)
        return this.prisma.assessmentSubmission.groupBy({
            by: ['status'],
            where: {
                OR: [
                    { reviewedBy: userId },
                    { status: 'PENDING' }
                ]
            },
            _count: {
                status: true,
            },
        });
    }
}
