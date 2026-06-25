import { Injectable } from "@nestjs/common";
import { PrismaService } from "@global/prisma/prisma.service";

@Injectable()
export class HomePageRepository {
    constructor(private readonly prisma: PrismaService) {}

    findContent() {
        return this.prisma.homePageContent.findFirst({
            include: {
                heroMedia: true,
                heroBadgeImage: true,
                aboutMedia: true,
                faqCardMedia: true,
                aboutFeaturedService1: true,
                aboutFeaturedService2: true,
                aboutFeaturedService3: true,
            },
        });
    }

    createContent(data: any) {
        return this.prisma.homePageContent.create({
            data,
            include: {
                heroMedia: true,
                heroBadgeImage: true,
                aboutMedia: true,
                faqCardMedia: true,
                aboutFeaturedService1: true,
                aboutFeaturedService2: true,
                aboutFeaturedService3: true,
            },
        });
    }

    async updateContent(id: string, data: any) {
        return this.prisma.homePageContent.update({
            where: { id },
            data,
            include: {
                heroMedia: true,
                heroBadgeImage: true,
                aboutMedia: true,
                faqCardMedia: true,
                aboutFeaturedService1: true,
                aboutFeaturedService2: true,
                aboutFeaturedService3: true,
            },
        });
    }
}
