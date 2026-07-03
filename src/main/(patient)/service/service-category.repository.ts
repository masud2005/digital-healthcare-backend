import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ServiceCategoryRepository {
    constructor(private readonly prisma: PrismaService) {}

    findAllNames() {
        return this.prisma.category.findMany({
            where: { status: "ACTIVE" },
            select: {
                id: true,
                name: true,
            },
        });
    }

    findAll(categoryName?: string) {
        return this.prisma.category.findMany({
            where: {
                status: "ACTIVE",
                ...(categoryName ? { name: { contains: categoryName, mode: "insensitive" } } : {}),
            },
            select: {
                id: true,
                name: true,
                description: true,
                icon: true,
                paymentPlan: true,
                assessments: {
                    where: { status: "ACTIVE" },
                    select: {
                        id: true,
                        title: true,
                        thumbnail: true,
                        description: true,
                        status: true,
                        publishedAt: true,
                        createdAt: true,
                    },
                },
            },
        });
    }

    findProductsByCategory(categoryId: string) {
        return this.prisma.product.findMany({
            where: { categoryId },
            select: {
                id: true,
                name: true,
            },
        });
    }
}
