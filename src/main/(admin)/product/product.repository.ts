import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "@global/prisma/prisma.service";
import type { Prisma } from "@prisma/client";

type ProductCreateData = {
    name: string;
    slug: string;
    images: string[];
    price?: string | null;
    stockQuantity?: number | null;
    description?: string | null;
    categoryId: string;
    variants?: Array<{
        size: string;
        price: string;
        stockQuantity: number;
    }>;
};

type ProductUpdateData = {
    name?: string;
    slug?: string;
    images?: string[];
    price?: string | null;
    stockQuantity?: number | null;
    description?: string | null;
    categoryId?: string;
    variants?: Array<{
        size: string;
        price: string;
        stockQuantity: number;
    }>;
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
        const { images, variants, ...rest } = data;
        return this.prisma.product.create({
            data: {
                ...rest,
                images: {
                    connect: images.map((id) => ({ id })),
                },
                ...(variants && variants.length > 0
                    ? {
                          variants: {
                              create: variants,
                          },
                      }
                    : {}),
            },
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

    findBySlug(slug: string) {
        return this.prisma.product.findUnique({
            where: { slug },
        });
    }

    async update(id: string, data: ProductUpdateData) {
        const { images, variants, ...rest } = data;
        return this.prisma.$transaction(async (tx) => {
            if (variants) {
                await tx.productVariant.deleteMany({
                    where: { productId: id },
                });
            }

            return tx.product.update({
                where: { id },
                data: {
                    ...rest,
                    ...(images
                        ? {
                              images: {
                                  set: images.map((imgId) => ({ id: imgId })),
                              },
                          }
                        : {}),
                    ...(variants && variants.length > 0
                        ? {
                              variants: {
                                  create: variants,
                              },
                          }
                        : {}),
                },
                include: this.productInclude,
            });
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

    async validateProductImages(imageIds: string[], productId?: string) {
        const attachments = await this.prisma.attachment.findMany({
            where: {
                id: { in: imageIds },
            },
            select: {
                id: true,
                context: true,
                productId: true,
            },
        });

        if (attachments.length !== imageIds.length) {
            throw new BadRequestException("One or more image attachments not found");
        }

        for (const attachment of attachments) {
            if (attachment.context !== "PRODUCT_IMAGE") {
                throw new BadRequestException(`Attachment ${attachment.id} is not a product image`);
            }
            if (attachment.productId && attachment.productId !== productId) {
                throw new BadRequestException(
                    `Attachment ${attachment.id} is already assigned to another product`,
                );
            }
        }
    }

    deleteAttachment(id: string) {
        return this.prisma.attachment.delete({
            where: { id },
        });
    }

    private readonly productInclude = {
        category: {
            select: {
                id: true,
                name: true,
            },
        },
        images: true,
        variants: {
            orderBy: {
                createdAt: "asc",
            },
        },
    } satisfies Prisma.ProductInclude;
}
