import type { SystemHealthStatus } from "@constant/enums";
import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

type SystemHealthFindAllParams = {
    search?: string;
    category?: string;
    status?: SystemHealthStatus;
    isActive?: boolean;
    checkedFrom?: Date;
    checkedTo?: Date;
    page: number;
    limit: number;
};

type SystemHealthMetricFindAllParams = {
    search?: string;
    isActive?: boolean;
    page: number;
    limit: number;
};

@Injectable()
export class SystemHealthRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(params: SystemHealthFindAllParams) {
        const { page, limit } = params;
        const where = this.buildWhere(params);

        const [data, total] = await this.prisma.$transaction([
            this.prisma.systemHealth.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { checkedAt: "desc" },
            }),
            this.prisma.systemHealth.count({ where }),
        ]);

        return { data, total };
    }

    findById(id: string) {
        return this.prisma.systemHealth.findUnique({
            where: { id },
        });
    }

    async getSummary() {
        const [services, metrics, counts] = await this.prisma.$transaction([
            this.prisma.systemHealth.findMany({
                where: { isActive: true },
                orderBy: { name: "asc" },
            }),
            this.prisma.systemHealthMetric.findMany({
                where: { isActive: true },
                orderBy: { label: "asc" },
            }),
            this.prisma.systemHealth.groupBy({
                by: ["status"],
                where: { isActive: true },
                orderBy: { status: "asc" },
                _count: { _all: true },
            }),
        ]);

        return { services, metrics, counts };
    }

    async findAllMetrics(params: SystemHealthMetricFindAllParams) {
        const { page, limit } = params;
        const where = this.buildMetricWhere(params);

        const [data, total] = await this.prisma.$transaction([
            this.prisma.systemHealthMetric.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { recordedAt: "desc" },
            }),
            this.prisma.systemHealthMetric.count({ where }),
        ]);

        return { data, total };
    }

    findMetricById(id: string) {
        return this.prisma.systemHealthMetric.findUnique({
            where: { id },
        });
    }

    createLog(data: {
        systemKey: string;
        status: SystemHealthStatus;
        responseTimeMs?: number;
        message?: string;
    }) {
        return this.prisma.systemHealthLog.create({
            data,
        });
    }

    getLogs(systemKey: string, limit: number) {
        return this.prisma.systemHealthLog.findMany({
            where: { systemKey },
            orderBy: { createdAt: "desc" },
            take: limit,
        });
    }

    getLogsSince(systemKey: string, since: Date) {
        return this.prisma.systemHealthLog.findMany({
            where: {
                systemKey,
                createdAt: { gte: since },
            },
            orderBy: { createdAt: "desc" },
        });
    }

    async updateServiceHealth(
        key: string,
        data: {
            status: SystemHealthStatus;
            responseTimeMs?: number | null;
            uptimePercent?: number;
            message?: string | null;
        },
    ) {
        return this.prisma.systemHealth.update({
            where: { key },
            data: {
                status: data.status,
                responseTimeMs: data.responseTimeMs,
                uptimePercent: data.uptimePercent,
                message: data.message,
                checkedAt: new Date(),
            },
        });
    }

    async upsertMetricValue(
        key: string,
        label: string,
        value: number,
        unit?: string | null,
        displayValue?: string | null,
    ) {
        return this.prisma.systemHealthMetric.upsert({
            where: { key },
            update: {
                value,
                unit,
                displayValue,
                recordedAt: new Date(),
            },
            create: {
                key,
                label,
                value,
                unit,
                displayValue,
                recordedAt: new Date(),
            },
        });
    }

    async upsertService(data: {
        key: string;
        name: string;
        category: string;
        status: SystemHealthStatus;
        description: string;
        responseTimeMs?: number | null;
        uptimePercent?: number | null;
        message?: string | null;
    }) {
        return this.prisma.systemHealth.upsert({
            where: { key: data.key },
            update: {},
            create: {
                key: data.key,
                name: data.name,
                category: data.category,
                status: data.status,
                description: data.description,
                responseTimeMs: data.responseTimeMs,
                uptimePercent: data.uptimePercent,
                message: data.message,
                isActive: true,
            },
        });
    }

    countActiveUsers() {
        return this.prisma.user.count();
    }

    countPendingSubmissions() {
        return this.prisma.assessmentSubmission.count({
            where: { status: "PENDING" },
        });
    }

    private buildWhere(params: SystemHealthFindAllParams): Prisma.SystemHealthWhereInput {
        const checkedAtFilter = this.buildDateRangeFilter(params.checkedFrom, params.checkedTo);

        return {
            ...(params.category
                ? { category: { equals: params.category, mode: "insensitive" } }
                : {}),
            ...(params.status ? { status: params.status } : {}),
            ...(params.isActive !== undefined ? { isActive: params.isActive } : {}),
            ...(checkedAtFilter ? { checkedAt: checkedAtFilter } : {}),
            ...(params.search
                ? {
                      OR: [
                          { name: { contains: params.search, mode: "insensitive" } },
                          { category: { contains: params.search, mode: "insensitive" } },
                          { message: { contains: params.search, mode: "insensitive" } },
                      ],
                  }
                : {}),
        };
    }

    private buildDateRangeFilter(from?: Date, to?: Date): Prisma.DateTimeFilter | undefined {
        if (!from && !to) {
            return undefined;
        }

        return {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
        };
    }

    private buildMetricWhere(
        params: SystemHealthMetricFindAllParams,
    ): Prisma.SystemHealthMetricWhereInput {
        return {
            ...(params.isActive !== undefined ? { isActive: params.isActive } : {}),
            ...(params.search
                ? {
                      OR: [
                          { label: { contains: params.search, mode: "insensitive" } },
                          { key: { contains: params.search, mode: "insensitive" } },
                      ],
                  }
                : {}),
        };
    }
}
