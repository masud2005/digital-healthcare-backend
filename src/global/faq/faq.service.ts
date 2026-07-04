import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { PageType } from "@prisma/client";
import { UpdateFaqDto } from "./dto/update-faq.dto";
import { GetFaqQueryDto } from "./dto/get-faq.dto";

@Injectable()
export class FaqService {
    constructor(private readonly prisma: PrismaService) {}

    async get(query: GetFaqQueryDto) {
        let faq = await this.prisma.faq.findFirst({
            where: { pageType: query.pageType },
            include: {
                faqs: {
                    orderBy: { order: "asc" },
                },
            },
        });

        if (!faq) {
            faq = await this.prisma.faq.create({
                data: {
                    pageType: query.pageType,
                    sectionTitle: "Frequently Asked Questions",
                },
                include: {
                    faqs: true,
                },
            });
        }

        return {
            success: true,
            message: "FAQ retrieved successfully",
            data: faq,
        };
    }

    async update(dto: UpdateFaqDto) {
        let faq = await this.prisma.faq.findFirst({
            where: { pageType: dto.pageType },
        });

        if (!faq) {
            faq = await this.prisma.faq.create({
                data: {
                    pageType: dto.pageType,
                    sectionTitle: dto.sectionTitle || "Frequently Asked Questions",
                },
            });
        } else if (dto.sectionTitle) {
            faq = await this.prisma.faq.update({
                where: { id: faq.id },
                data: { sectionTitle: dto.sectionTitle },
            });
        }

        if (dto.faqs) {
            await this.prisma.faqItem.deleteMany({
                where: { faqId: faq.id },
            });

            if (dto.faqs.length > 0) {
                await this.prisma.faqItem.createMany({
                    data: dto.faqs.map((item, index) => ({
                        faqId: faq.id!,
                        question: item.question,
                        answer: item.answer,
                        order: index,
                    })),
                });
            }
        }

        return this.get({ pageType: dto.pageType });
    }
}
