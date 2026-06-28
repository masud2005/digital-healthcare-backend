import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

export type BlogCreateData = {
    title: string;
    slug: string;
    content: string;
    isPublished?: boolean;
    authorId: string;
    categoryId: string;
    providerId?: string | null;
    featuredImageId?: string | null;
};

export type BlogUpdateData = {
    title?: string;
    slug?: string;
    content?: string;
    isPublished?: boolean;
    categoryId?: string;
    providerId?: string | null;
    featuredImageId?: string | null;
};

type BlogFindAllParams = {
    search?: string;
    categoryId?: string;
    isPublished?: boolean;
    page: number;
    limit: number;
};

const blogInclude = {
    author: {
        select: {
            id: true,
            name: true,
            email: true,
        },
    },
    category: true,
    provider: {
        include: {
            avatar: true,
        },
    },
    featuredImage: true,
} as const;

@Injectable()
export class BlogsRepository {
    constructor(private readonly prisma: PrismaService) {}

    create(data: BlogCreateData) {
        return this.prisma.blog.create({
            data,
            include: blogInclude,
        });
    }

    count(where?: Prisma.BlogWhereInput) {
        return this.prisma.blog.count({ where });
    }

    async findAll(params: BlogFindAllParams) {
        const { page, limit } = params;
        const where = this.buildWhere(params);

        const [data, total] = await this.prisma.$transaction([
            this.prisma.blog.findMany({
                where,
                include: blogInclude,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            this.prisma.blog.count({ where }),
        ]);

        return { data, total };
    }

    findById(id: string) {
        return this.prisma.blog.findUnique({
            where: { id },
            include: blogInclude,
        });
    }

    findBySlug(slug: string) {
        return this.prisma.blog.findUnique({
            where: { slug },
            include: blogInclude,
        });
    }

    update(id: string, data: BlogUpdateData) {
        return this.prisma.blog.update({
            where: { id },
            data,
            include: blogInclude,
        });
    }

    delete(id: string) {
        return this.prisma.blog.delete({
            where: { id },
        });
    }

    private buildWhere(params: BlogFindAllParams): Prisma.BlogWhereInput {
        const conditions: Prisma.BlogWhereInput[] = [];

        if (params.isPublished !== undefined) {
            conditions.push({ isPublished: params.isPublished });
        }

        if (params.categoryId) {
            conditions.push({ categoryId: params.categoryId });
        }

        if (params.search) {
            conditions.push({
                OR: [
                    { title: { contains: params.search, mode: "insensitive" } },
                    { content: { contains: params.search, mode: "insensitive" } },
                ],
            });
        }

        return conditions.length > 0 ? { AND: conditions } : {};
    }
}
