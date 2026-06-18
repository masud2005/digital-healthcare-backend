import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PublicProductRepository {
    constructor(private readonly prisma: PrismaService) {}

    findCategoriesWithProducts(categoryId: string) {
        return this.prisma.category.findMany({
            where: { status: "ACTIVE", id: categoryId },
            orderBy: { name: "asc" },
            select: {
                id: true,
                name: true,
                assessments: {
                    where: { status: "ACTIVE" },
                    select: { id: true, title: true },
                },
                products: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        price: true,
                        images: {
                            select: { id: true, fileUrl: true },
                            take: 1,
                        },
                        variants: {
                            select: { price: true },
                            orderBy: { createdAt: "asc" },
                            take: 1,
                        },
                    },
                },
            },
        });
    }
}
