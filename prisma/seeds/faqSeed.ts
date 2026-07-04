import { PrismaClient, PageType } from "@prisma/client";

export const faqSeed = async (prisma: PrismaClient) => {
    console.log("🌱 Seeding FAQs...");

    for (const pageType of Object.values(PageType)) {
        const existingFaq = await prisma.faq.findFirst({
            where: { pageType: pageType as PageType },
        });

        if (!existingFaq) {
            await prisma.faq.create({
                data: {
                    pageType: pageType as PageType,
                    sectionTitle: "Frequently Asked Questions",
                    faqs: {
                        create: [
                            {
                                question: "What is this service?",
                                answer: "This is a placeholder answer. Please update via the admin panel.",
                                order: 1,
                            },
                            {
                                question: "How does it work?",
                                answer: "This is a placeholder answer. Please update via the admin panel.",
                                order: 2,
                            },
                        ],
                    },
                },
            });
        }
    }

    console.log("✅ FAQs seeding completed!");
};
