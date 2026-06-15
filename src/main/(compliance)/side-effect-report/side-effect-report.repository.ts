import type { SideEffectSeverity, SideEffectStatus } from "@constant/enums";
import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

export type SideEffectReportCreateData = {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    severity: SideEffectSeverity;
    description: string;
    status?: SideEffectStatus;
    serviceId: string;
    providerId: string;
    attachmentIds?: string[];
    createdAt?: Date;
};

export type SideEffectReportUpdateData = Partial<
    Omit<SideEffectReportCreateData, "attachmentIds">
> & {
    attachmentIds?: string[];
};

export type SideEffectReportFindAllParams = {
    search?: string;
    severity?: SideEffectSeverity;
    status?: SideEffectStatus;
    serviceId?: string;
    providerId?: string;
    from?: Date;
    to?: Date;
    page: number;
    limit: number;
};

const reportInclude = {
    service: {
        select: {
            id: true,
            name: true,
        },
    },
    provider: {
        select: {
            id: true,
            name: true,
        },
    },
    attachments: {
        select: {
            id: true,
            fileName: true,
            fileUrl: true,
            fileType: true,
            fileSize: true,
        },
    },
} as const;

@Injectable()
export class SideEffectReportRepository {
    constructor(private readonly prisma: PrismaService) {}

    count(where?: Prisma.SideEffectReportWhereInput) {
        return this.prisma.sideEffectReport.count({ where });
    }

    async create(data: SideEffectReportCreateData) {
        const { attachmentIds, ...rest } = data;
        return this.prisma.sideEffectReport.create({
            data: {
                ...rest,
                ...(attachmentIds && attachmentIds.length > 0
                    ? {
                          attachments: {
                              connect: attachmentIds.map((id) => ({ id })),
                          },
                      }
                    : {}),
            },
            include: reportInclude,
        });
    }

    async findAll(params: SideEffectReportFindAllParams) {
        const { page, limit } = params;
        const where = this.buildWhere(params);

        const [data, total] = await this.prisma.$transaction([
            this.prisma.sideEffectReport.findMany({
                where,
                include: reportInclude,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            this.prisma.sideEffectReport.count({ where }),
        ]);

        return { data, total };
    }

    findById(id: string) {
        return this.prisma.sideEffectReport.findUnique({
            where: { id },
            include: reportInclude,
        });
    }

    async update(id: string, data: SideEffectReportUpdateData) {
        const { attachmentIds, ...rest } = data;
        return this.prisma.sideEffectReport.update({
            where: { id },
            data: {
                ...rest,
                ...(attachmentIds
                    ? {
                          attachments: {
                              set: attachmentIds.map((id) => ({ id })),
                          },
                      }
                    : {}),
            },
            include: reportInclude,
        });
    }

    delete(id: string) {
        return this.prisma.sideEffectReport.delete({
            where: { id },
        });
    }

    async getOverview() {
        const [total, pending, lifeThreatening, withAttachments] = await this.prisma.$transaction([
            this.prisma.sideEffectReport.count(),
            this.prisma.sideEffectReport.count({ where: { status: "PENDING" } }),
            this.prisma.sideEffectReport.count({ where: { severity: "LIFE_THREATENING" } }),
            this.prisma.sideEffectReport.count({
                where: {
                    attachments: {
                        some: {},
                    },
                },
            }),
        ]);

        return {
            total,
            pending,
            lifeThreatening,
            withAttachments,
        };
    }

    private buildWhere(params: SideEffectReportFindAllParams): Prisma.SideEffectReportWhereInput {
        const createdAtFilter = this.buildDateRangeFilter(params.from, params.to);

        return {
            ...(params.severity ? { severity: params.severity } : {}),
            ...(params.status ? { status: params.status } : {}),
            ...(params.serviceId ? { serviceId: params.serviceId } : {}),
            ...(params.providerId ? { providerId: params.providerId } : {}),
            ...(createdAtFilter ? { createdAt: createdAtFilter } : {}),
            ...(params.search
                ? {
                      OR: [
                          { firstName: { contains: params.search, mode: "insensitive" } },
                          { lastName: { contains: params.search, mode: "insensitive" } },
                          { email: { contains: params.search, mode: "insensitive" } },
                          { description: { contains: params.search, mode: "insensitive" } },
                          {
                              service: {
                                  name: { contains: params.search, mode: "insensitive" },
                              },
                          },
                          {
                              provider: {
                                  name: { contains: params.search, mode: "insensitive" },
                              },
                          },
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
