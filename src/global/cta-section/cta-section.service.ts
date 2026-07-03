import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { PageType } from "@prisma/client";
import { UpdateCtaSectionDto } from "./dto/update-cta-section.dto";

@Injectable()
export class CtaSectionService {
    constructor(private readonly prisma: PrismaService) {}

    async update(id: string, dto: UpdateCtaSectionDto) {
        const existing = await this.prisma.bottomCtaSection.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundException("CTA section not found");
        }

        const ctaSection = await this.prisma.bottomCtaSection.update({
            where: { id },
            data: dto,
        });

        return {
            success: true,
            message: "CTA section updated successfully",
            data: ctaSection,
        };
    }

    async findAll(pageType: PageType) {
        const ctaSections = await this.prisma.bottomCtaSection.findMany({
            where: { page: pageType },
            orderBy: { createdAt: "desc" },
        });

        return {
            success: true,
            message: "CTA sections retrieved successfully",
            data: ctaSections,
        };
    }
}
