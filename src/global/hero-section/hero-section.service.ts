import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { PageType } from "@prisma/client";
import { UpdateHeroSectionDto } from "./dto/update-hero-section.dto";

@Injectable()
export class HeroSectionService {
    constructor(private readonly prisma: PrismaService) {}

    async update(id: string, dto: UpdateHeroSectionDto) {
        const existing = await this.prisma.heroSection.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundException("Hero section not found");
        }

        const heroSection = await this.prisma.heroSection.update({
            where: { id },
            data: dto,
        });

        return {
            success: true,
            message: "Hero section updated successfully",
            data: heroSection,
        };
    }

    async findAll(pageType: PageType) {
        const heroSections = await this.prisma.heroSection.findMany({
            where: { page: pageType },
            orderBy: { createdAt: "desc" },
        });

        return {
            success: true,
            message: "Hero sections retrieved successfully",
            data: heroSections,
        };
    }
}
