import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@global/prisma/prisma.service";
import { UpdateServicePageDto } from "./dto/update-service-page.dto";

import { StorageService } from "@global/storage/storage.service";

@Injectable()
export class AdminServicePageService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly storageService: StorageService,
    ) {}

    async getServicePage(categoryId: string) {
        // Ensure category exists
        const category = await this.prisma.category.findUnique({
            where: { id: categoryId },
        });

        if (!category) {
            throw new NotFoundException("Category not found");
        }

        const heroSection = await this.prisma.servicePageHeroSection.findUnique({
            where: { categoryId },
            include: { bannerImage: true },
        });

        const secondSection = await this.prisma.servicePageSecondSection.findUnique({
            where: { categoryId },
            include: { featuredMedia: true },
        });

        const faqSection = await this.prisma.servicePageFaqSection.findUnique({
            where: { categoryId },
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
                heroSection,
                secondSection,
                faqSection,
            },
        };
    }

    async updateServicePage(categoryId: string, dto: UpdateServicePageDto) {
        const category = await this.prisma.category.findUnique({
            where: { id: categoryId },
        });

        if (!category) {
            throw new NotFoundException("Category not found");
        }

        return await this.prisma.$transaction(async (tx) => {
            let heroSection;
            let secondSection;
            let faqSection;

            // 1. Upsert Hero Section
            if (dto.heroSection) {
                heroSection = await tx.servicePageHeroSection.upsert({
                    where: { categoryId },
                    create: {
                        categoryId,
                        ...dto.heroSection,
                    },
                    update: {
                        ...dto.heroSection,
                    },
                    include: { bannerImage: true },
                });
            }

            // 2. Upsert Second Section
            if (dto.secondSection) {
                secondSection = await tx.servicePageSecondSection.upsert({
                    where: { categoryId },
                    create: {
                        categoryId,
                        ...dto.secondSection,
                    },
                    update: {
                        ...dto.secondSection,
                    },
                    include: { featuredMedia: true },
                });
            }

            // 3. Upsert FAQ Section
            if (dto.faqSection) {
                faqSection = await tx.servicePageFaqSection.upsert({
                    where: { categoryId },
                    create: {
                        categoryId,
                        sectionTitle: dto.faqSection.sectionTitle,
                    },
                    update: {
                        sectionTitle: dto.faqSection.sectionTitle,
                    },
                });

                // Upsert FAQ Items (Full replacement)
                if (dto.faqSection.faqs) {
                    await tx.servicePageFaqItem.deleteMany({
                        where: { faqSectionId: faqSection.id },
                    });

                    if (dto.faqSection.faqs.length > 0) {
                        const newFaqs = dto.faqSection.faqs.map((faq, index) => ({
                            faqSectionId: faqSection.id,
                            question: faq.question,
                            answer: faq.answer,
                            order: index,
                        }));
                        await tx.servicePageFaqItem.createMany({
                            data: newFaqs,
                        });
                    }
                }

                // Fetch the updated section with faqs
                faqSection = await tx.servicePageFaqSection.findUnique({
                    where: { id: faqSection.id },
                    include: {
                        faqs: { orderBy: { order: "asc" } },
                    },
                });
            }

            const updatedHeroSection =
                heroSection ||
                (await tx.servicePageHeroSection.findUnique({
                    where: { categoryId },
                    include: { bannerImage: true },
                }));
            const updatedSecondSection =
                secondSection ||
                (await tx.servicePageSecondSection.findUnique({
                    where: { categoryId },
                    include: { featuredMedia: true },
                }));
            const updatedFaqSection =
                faqSection ||
                (await tx.servicePageFaqSection.findUnique({
                    where: { categoryId },
                    include: { faqs: true },
                }));

            if (updatedHeroSection?.bannerImage) {
                updatedHeroSection.bannerImage.fileUrl = await this.storageService.getSignedUrl(
                    updatedHeroSection.bannerImage.fileUrl,
                );
            }

            if (updatedSecondSection?.featuredMedia) {
                updatedSecondSection.featuredMedia.fileUrl = await this.storageService.getSignedUrl(
                    updatedSecondSection.featuredMedia.fileUrl,
                );
            }

            return {
                success: true,
                message: "Service page updated successfully",
                data: {
                    heroSection: updatedHeroSection,
                    secondSection: updatedSecondSection,
                    faqSection: updatedFaqSection,
                },
            };
        });
    }
}
