import { Injectable } from "@nestjs/common";
import { PrismaService } from "@global/prisma/prisma.service";
import type { Prisma } from "@prisma/client";

type ProductCreateData = {
    name: string;
    images: string[];
    price: string;
    stockQuantity?: number;
    description?: string | null;
    categoryId: string;
};

type ProductUpdateData = {
    name?: string;
    images?: string[];
    price?: string;
    stockQuantity?: number;
    description?: string | null;
    categoryId?: string;
};

type ProductFindAllParams = {
    search?: string;
    categoryId?: string;
    page: number;
    limit: number;
};

@Injectable()
export class ProductRepository {
    constructor(private readonly prisma: PrismaService) {}

    create(data: ProductCreateData) {
        return this.prisma.product.create({
            data,
            include: this.productInclude,
        });
    }

    async findAll(params: ProductFindAllParams) {
        const { page, limit, search, categoryId } = params;
        const where: Prisma.ProductWhereInput = {
            ...(categoryId ? { categoryId } : {}),
            ...(search
                ? {
                      OR: [
                          { name: { contains: search, mode: "insensitive" } },
                          { description: { contains: search, mode: "insensitive" } },
                      ],
                  }
                : {}),
        };

        const [data, total] = await this.prisma.$transaction([
            this.prisma.product.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: this.productInclude,
            }),
            this.prisma.product.count({ where }),
        ]);

        return { data, total };
    }

    findById(id: string) {
        return this.prisma.product.findUnique({
            where: { id },
            include: this.productInclude,
        });
    }

    findByName(name: string) {
        return this.prisma.product.findFirst({
            where: { name },
        });
    }

    update(id: string, data: ProductUpdateData) {
        return this.prisma.product.update({
            where: { id },
            data,
            include: this.productInclude,
        });
    }

    delete(id: string) {
        return this.prisma.product.delete({
            where: { id },
        });
    }

    findCategoryById(categoryId: string) {
        return this.prisma.category.findUnique({
            where: { id: categoryId },
            select: { id: true },
        });
    }

    private readonly productInclude = {
        category: {
            select: {
                id: true,
                name: true,
            },
        },
    } satisfies Prisma.ProductInclude;
}
