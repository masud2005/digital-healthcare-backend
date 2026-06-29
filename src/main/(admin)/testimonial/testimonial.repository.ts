import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

type TestimonialCreateData = {
    clientName: string;
    feedback?: string | null;
    rating: number;
    date: Date;
    avatarId?: string | null;
    isPublished?: boolean;
    googleReviewId?: string | null;
    isGoogleReviewDirty?: boolean;
};

type TestimonialUpdateData = {
    clientName?: string;
    feedback?: string | null;
    rating?: number;
    date?: Date;
    avatarId?: string | null;
    isPublished?: boolean;
    isGoogleReviewDirty?: boolean;
};

type GoogleReviewUpsertData = {
    clientName: string;
    feedback: string;
    rating: number;
    date: Date;
    googleReviewId: string;
    googleAvatarUrl?: string;
};

type TestimonialFindAllParams = {
    search?: string;
    isPublished?: boolean;
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
        return this.prisma.testimonial.create({
            data,
            include: { avatar: true },
        });
    }

    count() {
        return this.prisma.testimonial.count();
    }

    countGoogleReviews() {
        return this.prisma.testimonial.count({
            where: { googleReviewId: { not: null } },
        });
    }

    async findAll(params: TestimonialFindAllParams) {
        const { page, limit } = params;
        const where = this.buildWhere(params);

        const [data, total] = await this.prisma.$transaction([
            this.prisma.testimonial.findMany({
                where,
                include: { avatar: true },
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
            include: { avatar: true },
        });
    }

    update(id: string, data: TestimonialUpdateData) {
        return this.prisma.testimonial.update({
            where: { id },
            data,
            include: { avatar: true },
        });
    }

    delete(id: string) {
        return this.prisma.testimonial.delete({
            where: { id },
        });
    }

    findByGoogleReviewId(googleReviewId: string) {
        return this.prisma.testimonial.findUnique({
            where: { googleReviewId },
        });
    }

    /**
     * Upserts a Google-sourced review by its stable googleReviewId.
     *
     * - CREATE: inserts the row with isGoogleReviewDirty = false
     * - UPDATE: only updates clientName/feedback/rating/date if isGoogleReviewDirty is false
     *   (meaning the admin has NOT manually edited it). If dirty, we skip the update silently.
     *
     * Returns { action: 'created' | 'updated' | 'skipped' }.
     */
    async upsertByGoogleReviewId(
        data: GoogleReviewUpsertData,
    ): Promise<{ action: "created" | "updated" | "skipped" }> {
        const existing = await this.findByGoogleReviewId(data.googleReviewId);

        if (!existing) {
            await this.prisma.testimonial.create({
                data: {
                    clientName: data.clientName,
                    feedback: data.feedback,
                    rating: data.rating,
                    date: data.date,
                    googleReviewId: data.googleReviewId,
                    googleAvatarUrl: data.googleAvatarUrl ?? null,
                    isGoogleReviewDirty: false,
                    isPublished: true,
                },
            });
            return { action: "created" };
        }

        // Admin has manually edited this review — honour their changes and skip
        if (existing.isGoogleReviewDirty) {
            return { action: "skipped" };
        }

        await this.prisma.testimonial.update({
            where: { googleReviewId: data.googleReviewId },
            data: {
                clientName: data.clientName,
                feedback: data.feedback,
                rating: data.rating,
                date: data.date,
                // Always refresh the avatar URL — Google CDN links can change
                googleAvatarUrl: data.googleAvatarUrl ?? null,
            },
        });

        return { action: "updated" };
    }

    private buildWhere(params: TestimonialFindAllParams): Prisma.TestimonialWhereInput {
        const ratingFilter = this.buildNumberRangeFilter(params.minRating, params.maxRating);
        const dateFilter = this.buildDateRangeFilter(params.fromDate, params.toDate);

        return {
            ...(params.isPublished !== undefined ? { isPublished: params.isPublished } : {}),
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
