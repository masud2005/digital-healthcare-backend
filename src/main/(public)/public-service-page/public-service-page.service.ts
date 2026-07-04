import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@global/prisma/prisma.service";

import { StorageService } from "@global/storage/storage.service";

@Injectable()
export class PublicServicePageService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly storageService: StorageService,
    ) {}

    async getServicePageByCategoryId(categoryId: string) {
        const category = await this.prisma.category.findUnique({
            where: { id: categoryId },
            select: { id: true, name: true, slug: true },
        });

        if (!category) {
            throw new NotFoundException("Category not found");
        }

        const heroSection = await this.prisma.servicePageHeroSection.findUnique({
            where: { categoryId: category.id },
            include: { bannerImage: true },
        });

        const secondSection = await this.prisma.servicePageSecondSection.findUnique({
            where: { categoryId: category.id },
            include: { featuredMedia: true },
        });

        const faqSection = await this.prisma.servicePageFaqSection.findUnique({
            where: { categoryId: category.id },
            include: {
                faqs: {
                    orderBy: { order: "asc" },
                },
            },
        });

        if (heroSection?.bannerImage) {
            heroSection.bannerImage.fileUrl = await this.storageService.getSignedUrl(
                heroSection.bannerImage.fileUrl,
            );
        }

        if (secondSection?.featuredMedia) {
            secondSection.featuredMedia.fileUrl = await this.storageService.getSignedUrl(
                secondSection.featuredMedia.fileUrl,
            );
        }

        return {
            success: true,
            message: "Service page data retrieved successfully",
            data: {
                category,
                heroSection,
                secondSection,
                faqSection,
            },
        };
    }
}
