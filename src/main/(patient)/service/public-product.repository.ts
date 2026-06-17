import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PublicProductRepository {
    constructor(private readonly prisma: PrismaService) {}

    findCategoriesWithProducts(categoryName: string) {
        return this.prisma.category.findMany({
            where: { status: "ACTIVE", name: { contains: categoryName, mode: "insensitive" } },
            orderBy: { name: "asc" },
            select: {
                id: true,
                name: true,
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
