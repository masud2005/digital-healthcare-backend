import { Injectable } from "@nestjs/common";
import { PrismaService } from "@global/prisma/prisma.service";

@Injectable()
export class HomePageRepository {
    constructor(private readonly prisma: PrismaService) {}

    findContent() {
        return this.prisma.homePageContent.findFirst({
            include: {
                howItWorksSteps: { orderBy: { order: "asc" } },
                faqs: { orderBy: { order: "asc" } },
            },
        });
    }

    createContent(data: any) {
        return this.prisma.homePageContent.create({
            data,
            include: {
                howItWorksSteps: { orderBy: { order: "asc" } },
                faqs: { orderBy: { order: "asc" } },
            },
        });
    }

    async updateContent(id: string, data: any) {
        const { howItWorksSteps, faqs, ...contentData } = data;

        return this.prisma.$transaction(async (tx) => {
            // 1. Update primary fields
            await tx.homePageContent.update({
                where: { id },
                data: contentData,
            });

            // 2. Sync howItWorksSteps
            if (howItWorksSteps !== undefined) {
                const existing = await tx.howItWorksStep.findMany({
                    where: { homePageContentId: id },
                });

                const toCreate = howItWorksSteps.filter((s: any) => !s.id);
                const toUpdate = howItWorksSteps.filter((s: any) => !!s.id);
                const incomingIds = toUpdate.map((s: any) => s.id);
                const toDeleteIds = existing
                    .filter((s) => !incomingIds.includes(s.id))
                    .map((s) => s.id);

                if (toDeleteIds.length > 0) {
                    await tx.howItWorksStep.deleteMany({
                        where: { id: { in: toDeleteIds } },
                    });
                }
                for (const step of toCreate) {
                    await tx.howItWorksStep.create({
                        data: { ...step, homePageContentId: id },
                    });
                }
                for (const step of toUpdate) {
                    const { id: stepId, ...rest } = step;
                    await tx.howItWorksStep.update({
                        where: { id: stepId },
                        data: rest,
                    });
                }
            }

            // 3. Sync FAQs
            if (faqs !== undefined) {
                const existing = await tx.homePageFaq.findMany({
                    where: { homePageContentId: id },
                });

                const toCreate = faqs.filter((f: any) => !f.id);
                const toUpdate = faqs.filter((f: any) => !!f.id);
                const incomingIds = toUpdate.map((f: any) => f.id);
                const toDeleteIds = existing
                    .filter((f) => !incomingIds.includes(f.id))
                    .map((f) => f.id);

                if (toDeleteIds.length > 0) {
                    await tx.homePageFaq.deleteMany({
                        where: { id: { in: toDeleteIds } },
                    });
                }
                for (const faq of toCreate) {
                    await tx.homePageFaq.create({
                        data: { ...faq, homePageContentId: id },
                    });
                }
                for (const faq of toUpdate) {
                    const { id: faqId, ...rest } = faq;
                    await tx.homePageFaq.update({
                        where: { id: faqId },
                        data: rest,
                    });
                }
            }

            // 4. Return updated with relations
            return tx.homePageContent.findUnique({
                where: { id },
                include: {
                    howItWorksSteps: { orderBy: { order: "asc" } },
                    faqs: { orderBy: { order: "asc" } },
                },
            });
        });
    }
}
