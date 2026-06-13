import { Injectable } from "@nestjs/common";
import { PrismaService } from "@global/prisma/prisma.service";
import { AuditLogQueryDto } from "./dto/audit-log-query.dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class AuditLogRepository {
    constructor(private readonly prisma: PrismaService) {}

    async count(where: Prisma.AuditLogWhereInput) {
        return this.prisma.auditLog.count({ where });
    }

    private buildWhereClause(query: Partial<AuditLogQueryDto>): Prisma.AuditLogWhereInput {
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
                (where.createdAt as Prisma.DateTimeFilter).gte = new Date(query.startDate);
            }
            if (query.endDate) {
                (where.createdAt as Prisma.DateTimeFilter).lte = new Date(query.endDate);
            }
        }

        return where;
    }

    async findMany(query: AuditLogQueryDto) {
        const where = this.buildWhereClause(query);
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            this.prisma.auditLog.count({ where }),
        ]);

        return { data, total, page, limit };
    }

    async findAll(query: Partial<AuditLogQueryDto>) {
        const where = this.buildWhereClause(query);

        return this.prisma.auditLog.findMany({
            where,
            orderBy: { createdAt: "desc" },
        });
    }

    async create(data: Prisma.AuditLogUncheckedCreateInput) {
        return this.prisma.auditLog.create({ data });
    }

    async countActiveSessions() {
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
