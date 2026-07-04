import { PageType as PAGE_TYPES, PrismaClient } from "@prisma/client";

export const sideWidgetSeed = async (prisma: PrismaClient) => {
    console.log("🌱 Seeding Side Widgets...");

    const pageTypes = PAGE_TYPES;

    for (const pageType of Object.values(pageTypes)) {
        const existing = await prisma.sideWidget.findFirst({
            where: { page: pageType },
        });

        if (!existing) {
            await prisma.sideWidget.create({
                data: {
                    title: `Side Widget for ${pageType}`,
                    buttonText: "Learn More",
                    buttonUrl: "/",
                    isBlank: false,
                    page: pageType,
                },
            });
            console.log(`✅ Created Side Widget for ${pageType}`);
        }
    }

    console.log("✅ Side Widgets seeding completed!");
};
