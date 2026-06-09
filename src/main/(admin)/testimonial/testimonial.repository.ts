import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

type TestimonialCreateData = {
    clientName: string;
    feedback?: string | null;
    rating: number;
    date: Date;
};

type TestimonialUpdateData = {
    clientName?: string;
    feedback?: string | null;
    rating?: number;
    date?: Date;
};

type TestimonialFindAllParams = {
    search?: string;
    minRating?: number;
    maxRating?: number;
    fromDate?: Date;
    toDate?: Date;
    page: number;
    limit: number;
};

@Injectable()
export class TestimonialRepository {
    constructor(private readonly prisma: PrismaService) {}

    create(data: TestimonialCreateData) {
        return this.prisma.testimonial.create({ data });
    }

    async findAll(params: TestimonialFindAllParams) {
        const { page, limit } = params;
        const where = this.buildWhere(params);

        const [data, total] = await this.prisma.$transaction([
            this.prisma.testimonial.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { date: "desc" },
            }),
            this.prisma.testimonial.count({ where }),
        ]);

        return { data, total };
    }

    findById(id: string) {
        return this.prisma.testimonial.findUnique({
            where: { id },
        });
    }

    update(id: string, data: TestimonialUpdateData) {
        return this.prisma.testimonial.update({
            where: { id },
            data,
        });
    }

    delete(id: string) {
        return this.prisma.testimonial.delete({
            where: { id },
        });
    }

    private buildWhere(params: TestimonialFindAllParams): Prisma.TestimonialWhereInput {
        const ratingFilter = this.buildNumberRangeFilter(params.minRating, params.maxRating);
        const dateFilter = this.buildDateRangeFilter(params.fromDate, params.toDate);

        return {
            ...(ratingFilter ? { rating: ratingFilter } : {}),
            ...(dateFilter ? { date: dateFilter } : {}),
            ...(params.search
                ? {
                      OR: [
                          { clientName: { contains: params.search, mode: "insensitive" } },
                          { feedback: { contains: params.search, mode: "insensitive" } },
                      ],
                  }
                : {}),
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
