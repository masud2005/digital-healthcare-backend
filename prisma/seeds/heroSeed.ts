import { PageType as PAGE_TYPES, PrismaClient } from "@prisma/client";

export const heroSeed = async (prisma: PrismaClient) => {
    console.log("🌱 Seeding Hero Sections...");

    const pageTypes = PAGE_TYPES;

    for (const pageType of Object.values(pageTypes)) {
        const existing = await prisma.heroSection.findFirst({
            where: { page: pageType },
        });

        if (!existing) {
            await prisma.heroSection.create({
                data: {
                    title: `Welcome to ${pageType}`,
                    description: `This is the default hero section description for the ${pageType} page. Customize this in the admin panel.`,
                    page: pageType,
                },
            });
            console.log(`✅ Created Hero Section for ${pageType}`);
        }
    }

    console.log("✅ Hero Sections seeding completed!");
};
