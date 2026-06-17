import type { IncidentSeverity, IncidentSource, IncidentStatus } from "@constant/enums";
import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

type IncidentCreateData = {
    incidentId: string;
    type: string;
    severity: IncidentSeverity;
    status?: IncidentStatus;
    source?: IncidentSource;
    affectedSystem?: string | null;
    reportedBy?: string | null;
    assignedTo?: string | null;
    description?: string | null;
    responseSummary?: string | null;
    detectedAt?: Date;
    resolvedAt?: Date | null;
    metadata?: Prisma.InputJsonValue;
    isActive?: boolean;
};

type IncidentUpdateData = Partial<IncidentCreateData>;

type IncidentFindAllParams = {
    search?: string;
    severity?: IncidentSeverity;
    status?: IncidentStatus;
    source?: IncidentSource;
    isActive?: boolean;
    detectedFrom?: Date;
    detectedTo?: Date;
    page: number;
    limit: number;
    role?: string;
    type?: string;
};

@Injectable()
export class IncidentRepository {
    constructor(private readonly prisma: PrismaService) {}

    count(where?: Prisma.IncidentWhereInput) {
        return this.prisma.incident.count({ where });
    }

    create(data: IncidentCreateData) {
        return this.prisma.incident.create({ data });
    }

    findLatest() {
        return this.prisma.incident.findFirst({
            orderBy: { createdAt: "desc" },
        });
    }

    async findAll(params: IncidentFindAllParams) {
        const { page, limit } = params;
        const where = this.buildWhere(params);

        const [data, total] = await this.prisma.$transaction([
            this.prisma.incident.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { detectedAt: "desc" },
            }),
            this.prisma.incident.count({ where }),
        ]);

        return { data, total };
    }

    findById(id: string) {
        return this.prisma.incident.findUnique({
            where: { id },
        });
    }

    findByIncidentId(incidentId: string) {
        return this.prisma.incident.findUnique({
            where: { incidentId },
        });
    }

    update(id: string, data: IncidentUpdateData) {
        return this.prisma.incident.update({
            where: { id },
            data,
        });
    }

    delete(id: string) {
        return this.prisma.incident.delete({
            where: { id },
        });
    }

    async getOverview() {
        const [total, open, investigating, resolved, closed, severityCounts, latest] =
            await this.prisma.$transaction([
                this.prisma.incident.count({ where: { isActive: true } }),
                this.prisma.incident.count({ where: { isActive: true, status: "OPEN" } }),
                this.prisma.incident.count({ where: { isActive: true, status: "INVESTIGATING" } }),
                this.prisma.incident.count({ where: { isActive: true, status: "RESOLVED" } }),
                this.prisma.incident.count({ where: { isActive: true, status: "CLOSED" } }),
                this.prisma.incident.groupBy({
                    by: ["severity"],
                    where: { isActive: true },
                    orderBy: { severity: "asc" },
                    _count: { _all: true },
                }),
                this.prisma.incident.findMany({
                    where: { isActive: true },
                    orderBy: { detectedAt: "desc" },
                    take: 7,
                }),
            ]);

        return {
            counts: { total, open, investigating, resolved, closed },
            severityCounts,
            latest,
        };
    }

    private buildWhere(params: IncidentFindAllParams): Prisma.IncidentWhereInput {
        const detectedAtFilter = this.buildDateRangeFilter(params.detectedFrom, params.detectedTo);

        return {
            ...(params.severity ? { severity: params.severity } : {}),
            ...(params.status ? { status: params.status } : {}),
            ...(params.source ? { source: params.source } : {}),
            ...(params.isActive !== undefined ? { isActive: params.isActive } : {}),
            ...(detectedAtFilter ? { detectedAt: detectedAtFilter } : {}),
            ...(params.type ? { type: { equals: params.type, mode: "insensitive" } } : {}),
            ...(params.role
                ? {
                      metadata: {
                          path: ["userRole"],
                          equals: params.role.toUpperCase(),
                      },
                  }
                : {}),
            ...(params.search
                ? {
                      OR: [
                          { incidentId: { contains: params.search, mode: "insensitive" } },
                          { type: { contains: params.search, mode: "insensitive" } },
                          { affectedSystem: { contains: params.search, mode: "insensitive" } },
                          { reportedBy: { contains: params.search, mode: "insensitive" } },
                          { assignedTo: { contains: params.search, mode: "insensitive" } },
                          { description: { contains: params.search, mode: "insensitive" } },
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
}
