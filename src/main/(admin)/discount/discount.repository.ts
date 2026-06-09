import type { DiscountType } from "@constant/enums";
import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

type DiscountCreateData = {
    code: string;
    type: DiscountType;
    value: number;
    expiresAt?: Date | null;
    isActive?: boolean;
};

type DiscountUpdateData = {
    code?: string;
    type?: DiscountType;
    value?: number;
    expiresAt?: Date | null;
    isActive?: boolean;
};

type DiscountFindAllParams = {
    search?: string;
    type?: DiscountType;
    isActive?: boolean;
    minValue?: number;
    maxValue?: number;
    expiresFrom?: Date;
    expiresTo?: Date;
    page: number;
    limit: number;
};

@Injectable()
export class DiscountRepository {
    constructor(private readonly prisma: PrismaService) {}

    create(data: DiscountCreateData) {
        return this.prisma.discount.create({ data });
    }

    async findAll(params: DiscountFindAllParams) {
        const { page, limit } = params;
        const where = this.buildWhere(params);

        const [data, total] = await this.prisma.$transaction([
            this.prisma.discount.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            this.prisma.discount.count({ where }),
        ]);

        return { data, total };
    }

    findById(id: string) {
        return this.prisma.discount.findUnique({
            where: { id },
        });
    }

    findByCode(code: string) {
        return this.prisma.discount.findUnique({
            where: { code },
        });
    }

    update(id: string, data: DiscountUpdateData) {
        return this.prisma.discount.update({
            where: { id },
            data,
        });
    }

    delete(id: string) {
        return this.prisma.discount.delete({
            where: { id },
        });
    }

    private buildWhere(params: DiscountFindAllParams): Prisma.DiscountWhereInput {
        const valueFilter = this.buildNumberRangeFilter(params.minValue, params.maxValue);
        const expiresAtFilter = this.buildDateRangeFilter(params.expiresFrom, params.expiresTo);

        return {
            ...(params.type ? { type: params.type } : {}),
            ...(params.isActive !== undefined ? { isActive: params.isActive } : {}),
            ...(valueFilter ? { value: valueFilter } : {}),
            ...(expiresAtFilter ? { expiresAt: expiresAtFilter } : {}),
            ...(params.search ? { code: { contains: params.search, mode: "insensitive" } } : {}),
        };
    }

    private buildNumberRangeFilter(min?: number, max?: number): Prisma.FloatFilter | undefined {
        if (min === undefined && max === undefined) {
            return undefined;
        }

        return {
            ...(min !== undefined ? { gte: min } : {}),
            ...(max !== undefined ? { lte: max } : {}),
        };
    }

    private buildDateRangeFilter(
        from?: Date,
        to?: Date,
    ): Prisma.DateTimeNullableFilter | undefined {
        if (!from && !to) {
            return undefined;
        }

        return {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
        };
    }
}
