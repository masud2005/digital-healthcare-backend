import { PageType, PrismaClient } from "@prisma/client";

export async function pageSectionsSeed(prisma: PrismaClient) {
    console.log("🌱 Seeding page sections & CTA sections...");

    // 1. Seed CTA Sections for every PageType
    // The user wants exactly one per PageType
    const pageTypes = Object.values(PageType);

    for (const page of pageTypes) {
        const existingCta = await prisma.bottomCtaSection.findFirst({
            where: { page },
        });

        if (existingCta) {
            // Update existing
            await prisma.bottomCtaSection.update({
                where: { id: existingCta.id },
                data: {
                    sectionTitle: `Get Started with ${page} Today!`,
                    ctaButtonText: "Contact Us",
                    url: "https://example.com/contact",
                    openInNewTab: false,
                },
            });
        } else {
            // Create new
            await prisma.bottomCtaSection.create({
                data: {
                    page,
                    sectionTitle: `Get Started with ${page} Today!`,
                    ctaButtonText: "Contact Us",
                    url: "https://example.com/contact",
                    openInNewTab: false,
                },
            });
        }
    }

    console.log(`✅ Seeded ${pageTypes.length} CTA sections.`);
}
