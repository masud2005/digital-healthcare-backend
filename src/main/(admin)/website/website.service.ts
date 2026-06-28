import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { StorageService } from "@global/storage/storage.service";
import { AttachmentService } from "@global/attachment/attachment.service";
import { WebsiteRepository } from "./website.repository";
import { DEFAULT_WEBSITE_SETTINGS } from "./website-seed.data";

@Injectable()
export class WebsiteService implements OnModuleInit {
    private readonly logger = new Logger(WebsiteService.name);

    constructor(
        private readonly websiteRepository: WebsiteRepository,
        private readonly storageService: StorageService,
        private readonly attachmentService: AttachmentService,
    ) {}

    async onModuleInit() {
        await this.seedSettings();
    }

    async seedSettings() {
        try {
            const settings = await this.websiteRepository.findSettings();
            if (settings) {
                return;
            }

            this.logger.log("🌱 Seeding website settings...");
            await this.websiteRepository.createSettings(DEFAULT_WEBSITE_SETTINGS);
            this.logger.log("✅ Website settings successfully seeded.");
        } catch (error) {
            this.logger.error("Failed to seed website settings", error as Error);
        }
    }

    async getSettings() {
        let settings = await this.websiteRepository.findSettings();
        if (!settings) {
            await this.seedSettings();
            settings = await this.websiteRepository.findSettings();
        }
        return this.resolveSettingsImages(settings!);
    }

    async updateSettings(payload: any) {
        const dbSettings = await this.websiteRepository.findSettings();
        if (!dbSettings) {
            throw new Error("Settings not found");
        }

        const updateData: any = { ...payload };

        const attachmentFieldsWithContext: Record<string, string> = {
            whiteLogoId: "WEBSITE_LOGO",
            blackLogoId: "WEBSITE_LOGO",
            faviconLightId: "WEBSITE_FAVICON",
            faviconDarkId: "WEBSITE_FAVICON",
            socialPreviewId: "WEBSITE_SOCIAL_PREVIEW",
        };

        for (const [field, context] of Object.entries(attachmentFieldsWithContext)) {
            const newId = payload[field];
            const oldId = (dbSettings as any)[field];
            if (newId !== undefined && newId !== oldId) {
                if (oldId && typeof oldId === "string") {
                    await this.attachmentService.remove(oldId).catch(() => {});
                }
                if (newId && typeof newId === "string") {
                    await this.attachmentService
                        .replace(newId, { context: context as any })
                        .catch(() => {});
                }
            }
        }

        // Map social link array back to relational schema format
        if (payload.socialLinks !== undefined) {
            const existingSocialLinks = dbSettings.socialLinks || [];
            updateData.socialLinks = payload.socialLinks.map((s: any) => {
                const existing = existingSocialLinks.find((el) => el.name === s.name);
                return {
                    id: existing?.id,
                    name: s.name,
                    url: s.url,
                };
            });
        }

        const updated = await this.websiteRepository.updateSettings(dbSettings.id, updateData);
        return this.resolveSettingsImages(updated!);
    }

    async updateOfficeAddress(officeId: string | undefined, payload: any) {
        const dbSettings = await this.websiteRepository.findSettings();
        if (!dbSettings) {
            throw new Error("Settings not found");
        }

        if (officeId) {
            await this.websiteRepository.updateOffice(officeId, {
                name: payload.name,
                address: payload.address,
                isActive: payload.isActive,
            });
        } else {
            await this.websiteRepository.createOffice(dbSettings.id, {
                name: payload.name,
                address: payload.address,
                isActive: payload.isActive ?? true,
            });
        }

        return this.getSettings();
    }

    private async resolveSettingsImages(settings: any) {
        const [whiteLogo, blackLogo, faviconLight, faviconDark, socialPreview] = await Promise.all([
            settings.whiteLogo
                ? this.resolveAttachmentUrl(settings.whiteLogo)
                : Promise.resolve(null),
            settings.blackLogo
                ? this.resolveAttachmentUrl(settings.blackLogo)
                : Promise.resolve(null),
            settings.faviconLight
                ? this.resolveAttachmentUrl(settings.faviconLight)
                : Promise.resolve(null),
            settings.faviconDark
                ? this.resolveAttachmentUrl(settings.faviconDark)
                : Promise.resolve(null),
            settings.socialPreview
                ? this.resolveAttachmentUrl(settings.socialPreview)
                : Promise.resolve(null),
        ]);

        const socialLinks = settings.socialLinks || [];

        const { contactInfo, googleAnalytics, ...settingsWithoutRelations } = settings;

        return {
            ...settingsWithoutRelations,
            whiteLogo,
            blackLogo,
            faviconLight,
            faviconDark,
            socialPreview,
            contactInfo: contactInfo
                ? {
                      siteId: contactInfo.siteId,
                      phone: contactInfo.phone,
                      email: contactInfo.email,
                      openHours: contactInfo.openHours,
                      closedDays: contactInfo.closedDays,
                  }
                : null,
            googleAnalytics: googleAnalytics
                ? {
                      siteId: googleAnalytics.siteId,
                      gaMeasurementId: googleAnalytics.gaMeasurementId,
                  }
                : null,
            socialLinks: socialLinks.map((s: any) => ({
                name: s.name,
                url: s.url,
            })),
        };
    }

    private async resolveAttachmentUrl(attachment: any) {
        if (!attachment) return null;
        return {
            ...attachment,
            fileUrl: await this.storageService.getSignedUrl(attachment.fileUrl),
        };
    }
}
