import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { PageType } from "@prisma/client";
import { UpdateCtaSectionDto } from "./dto/update-cta-section.dto";
import { GetCtaSectionQueryDto } from "./dto/get-cta-section.dto";

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

    async findAll(query: GetCtaSectionQueryDto) {
        const { pageType, categoryId } = query;

        const whereClause: any = { page: pageType };
        if (categoryId) {
            whereClause.categoryId = categoryId;
        }

        let ctaSections = await this.prisma.bottomCtaSection.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
        });

        // Auto-create for existing categories if none found
        if (ctaSections.length === 0 && categoryId && pageType === PageType.ServiceCategory) {
            const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
            if (category) {
                const newCta = await this.prisma.bottomCtaSection.create({
                    data: {
                        page: PageType.ServiceCategory,
                        categoryId,
                        sectionTitle: "Explore This Category",
                        ctaButtonText: "Learn More",
                        url: "/register",
                    },
                });
                ctaSections = [newCta];
            }
        }

        return {
            success: true,
            message: "CTA sections retrieved successfully",
            data: ctaSections,
        };
    }
}
