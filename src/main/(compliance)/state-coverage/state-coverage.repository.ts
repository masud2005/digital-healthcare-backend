import { StateComplianceStatus } from "@constant/enums";
import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

export type StateCoverageCreateData = {
    stateCode: string;
    stateName: string;
    status?: StateComplianceStatus;
    isComingSoon?: boolean;
    allowedCategoryIds?: string[];
};

export type StateCoverageUpdateData = Partial<Omit<StateCoverageCreateData, "stateCode">> & {
    stateCode?: string;
};

export type StateCoverageFindAllParams = {
    search?: string;
    status?: StateComplianceStatus;
    page: number;
    limit: number;
};

const stateInclude = {
    allowedCategories: {
        select: {
            id: true,
            name: true,
        },
    },
} as const;

@Injectable()
export class StateCoverageRepository {
    constructor(private readonly prisma: PrismaService) {}

    count(where?: Prisma.StateCoverageWhereInput) {
        return this.prisma.stateCoverage.count({ where });
    }

    async create(data: StateCoverageCreateData) {
        const { allowedCategoryIds, ...rest } = data;
        return this.prisma.stateCoverage.create({
            data: {
                ...rest,
                ...(allowedCategoryIds && allowedCategoryIds.length > 0
                    ? {
                          allowedCategories: {
                              connect: allowedCategoryIds.map((id) => ({ id })),
                          },
                      }
                    : {}),
            },
            include: stateInclude,
        });
    }

    async findAll(params: StateCoverageFindAllParams) {
        const { page, limit } = params;
        const where = this.buildWhere(params);

        const [data, total] = await this.prisma.$transaction([
            this.prisma.stateCoverage.findMany({
                where,
                include: stateInclude,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { stateName: "asc" },
            }),
            this.prisma.stateCoverage.count({ where }),
        ]);

        return { data, total };
    }

    findById(id: string) {
        return this.prisma.stateCoverage.findUnique({
            where: { id },
            include: stateInclude,
        });
    }

    findByStateCode(stateCode: string) {
        return this.prisma.stateCoverage.findUnique({
            where: { stateCode },
            include: stateInclude,
        });
    }

    async update(id: string, data: StateCoverageUpdateData) {
        const { allowedCategoryIds, ...rest } = data;
        return this.prisma.stateCoverage.update({
            where: { id },
            data: {
                ...rest,
                ...(allowedCategoryIds
                    ? {
                          allowedCategories: {
                              set: allowedCategoryIds.map((id) => ({ id })),
                          },
                      }
                    : {}),
            },
            include: stateInclude,
        });
    }

    delete(id: string) {
        return this.prisma.stateCoverage.delete({
            where: { id },
        });
    }

    private buildWhere(params: StateCoverageFindAllParams): Prisma.StateCoverageWhereInput {
        return {
            ...(params.status ? { status: params.status } : {}),
            ...(params.search
                ? {
                      OR: [
                          { stateCode: { contains: params.search, mode: "insensitive" } },
                          { stateName: { contains: params.search, mode: "insensitive" } },
                      ],
                  }
                : {}),
        };
    }
}
