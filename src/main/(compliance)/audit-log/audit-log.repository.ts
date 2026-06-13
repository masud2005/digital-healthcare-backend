import { Injectable } from "@nestjs/common";
import { PrismaService } from "@global/prisma/prisma.service";
import { AuditLogQueryDto } from "./dto/audit-log-query.dto";
// Trigger rebuild
import { Prisma } from "@prisma/client";

@Injectable()
export class AuditLogRepository {
    constructor(private readonly prisma: PrismaService) {}

    async count(where: Prisma.AuditLogWhereInput) {
        return this.prisma.auditLog.count({ where });
    }

    async findMany(query: AuditLogQueryDto) {
        const where: Prisma.AuditLogWhereInput = {};

        if (query.search) {
            where.OR = [
                { userName: { contains: query.search, mode: "insensitive" } },
                { event: { contains: query.search, mode: "insensitive" } },
                { ipAddress: { contains: query.search, mode: "insensitive" } },
            ];
        }

        if (query.role) {
            where.userRole = { equals: query.role, mode: "insensitive" };
        }

        if (query.activityType) {
            where.activityType = { equals: query.activityType, mode: "insensitive" };
        }

        if (query.status) {
            where.status = { equals: query.status, mode: "insensitive" };
        }

        if (query.startDate || query.endDate) {
            where.createdAt = {};
            if (query.startDate) {
                where.createdAt.gte = new Date(query.startDate);
            }
            if (query.endDate) {
                where.createdAt.lte = new Date(query.endDate);
            }
        }

        const skip = (query.page! - 1) * query.limit!;
        const take = query.limit;

        const [data, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: "desc" },
            }),
            this.prisma.auditLog.count({ where }),
        ]);

        return { data, total };
    }

    async create(data: Prisma.AuditLogUncheckedCreateInput) {
        return this.prisma.auditLog.create({ data });
    }

    async countActiveSessions() {
        // Query active sessions from AuthSession where revokedAt is null and not expired
        return this.prisma.authSession.count({
            where: {
                revokedAt: null,
                expiresAt: { gte: new Date() },
            },
        });
    }

    async countFailedLoginsLastHour() {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return this.prisma.auditLog.count({
            where: {
                activityType: "Login",
                status: "FAILED",
                createdAt: { gte: oneHourAgo },
            },
        });
    }
}
