import { Injectable } from "@nestjs/common";
import { PrismaService } from "@global/prisma/prisma.service";
import type { Prisma } from "@prisma/client";

@Injectable()
export class WebsiteRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findSettings() {
        return this.prisma.siteSettings.findFirst({
            include: {
                offices: true,
                socialLinks: true,
                whiteLogo: true,
                blackLogo: true,
                faviconLight: true,
                faviconDark: true,
                socialPreview: true,
                contactInfo: true,
                googleAnalytics: true,
            },
        });
    }

    async createSettings(data: Prisma.SiteSettingsCreateInput) {
        return this.prisma.siteSettings.create({
            data,
            include: {
                offices: true,
                socialLinks: true,
                whiteLogo: true,
                blackLogo: true,
                faviconLight: true,
                faviconDark: true,
                socialPreview: true,
                contactInfo: true,
                googleAnalytics: true,
            },
        });
    }

    async updateSettings(id: string, data: any) {
        const { offices, socialLinks, contactInfo, googleAnalytics, ...settingsData } = data;

        return this.prisma.$transaction(async (tx) => {
            // 1. Update primary settings fields
            if (Object.keys(settingsData).length > 0) {
                await tx.siteSettings.update({
                    where: { id },
                    data: settingsData,
                });
            }

            // 2. Sync offices
            if (offices !== undefined) {
                const existingOffices = await tx.officeLocation.findMany({
                    where: { siteId: id },
                });

                const toCreate = offices.filter((o: any) => !o.id);
                const toUpdate = offices.filter((o: any) => o.id);

                const incomingIds = toUpdate.map((o: any) => o.id);
                const toDeleteIds = existingOffices
                    .filter((o) => !incomingIds.includes(o.id))
                    .map((o) => o.id);

                if (toDeleteIds.length > 0) {
                    await tx.officeLocation.deleteMany({
                        where: { id: { in: toDeleteIds } },
                    });
                }

                for (const o of toCreate) {
                    await tx.officeLocation.create({
                        data: {
                            ...o,
                            siteId: id,
                        },
                    });
                }

                for (const o of toUpdate) {
                    const { id: officeId, ...officeData } = o;
                    await tx.officeLocation.update({
                        where: { id: officeId },
                        data: officeData,
                    });
                }
            }

            // 3. Sync social links
            if (socialLinks !== undefined) {
                const existingSocialLinks = await tx.socialLink.findMany({
                    where: { siteId: id },
                });

                const toCreate = socialLinks.filter((s: any) => !s.id);
                const toUpdate = socialLinks.filter((s: any) => s.id);

                const incomingIds = toUpdate.map((s: any) => s.id);
                const toDeleteIds = existingSocialLinks
                    .filter((s) => !incomingIds.includes(s.id))
                    .map((s) => s.id);

                if (toDeleteIds.length > 0) {
                    await tx.socialLink.deleteMany({
                        where: { id: { in: toDeleteIds } },
                    });
                }

                for (const s of toCreate) {
                    await tx.socialLink.create({
                        data: {
                            ...s,
                            siteId: id,
                        },
                    });
                }

                for (const s of toUpdate) {
                    const { id: linkId, ...linkData } = s;
                    await tx.socialLink.update({
                        where: { id: linkId },
                        data: linkData,
                    });
                }
            }

            // 4. Sync contact info
            if (contactInfo !== undefined) {
                await tx.contactInfo.upsert({
                    where: { siteId: id },
                    create: { ...contactInfo, siteId: id },
                    update: contactInfo,
                });
            }

            // 5. Sync google analytics
            if (googleAnalytics !== undefined) {
                await tx.googleAnalyticsSetting.upsert({
                    where: { siteId: id },
                    create: { ...googleAnalytics, siteId: id },
                    update: googleAnalytics,
                });
            }

            // 6. Return updated settings with relations
            return tx.siteSettings.findUnique({
                where: { id },
                include: {
                    offices: true,
                    socialLinks: true,
                    whiteLogo: true,
                    blackLogo: true,
                    faviconLight: true,
                    faviconDark: true,
                    socialPreview: true,
                    contactInfo: true,
                    googleAnalytics: true,
                },
            });
        });
    }

    async updateOffice(officeId: string, data: any) {
        return this.prisma.officeLocation.update({
            where: { id: officeId },
            data,
        });
    }

    async createOffice(siteId: string, data: any) {
        return this.prisma.officeLocation.create({
            data: {
                ...data,
                siteId,
            },
        });
    }
}
