import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { StorageService } from "@global/storage/storage.service";
import { AttachmentService } from "@global/attachment/attachment.service";
import { WebsiteRepository } from "./website.repository";
import { UpdateWebsiteSettingsDto } from "./dto/update-website-settings.dto";
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
        // await this.seedSettings();
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

    async updateSettings(payload: UpdateWebsiteSettingsDto) {
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
            const newId = payload[field as keyof UpdateWebsiteSettingsDto];
            const oldId = dbSettings[field as keyof typeof dbSettings];
            if (newId !== undefined && newId !== oldId) {
                if (oldId && typeof oldId === "string") {
                    await this.attachmentService.remove(oldId).catch(() => {});
                }
                if (newId && typeof newId === "string") {
                    await this.attachmentService.replace(newId, { context: context as any }).catch(() => {});
                }
            }
        }

        // Map flat social link fields back to relational schema format
        const socialLinks = dbSettings.socialLinks || [];
        const mappedSocialLinks: any[] = [];

        if (payload.facebookUrl !== undefined) {
            const existing = socialLinks.find(s => s.platform === "facebook");
            mappedSocialLinks.push({ id: existing?.id, platform: "facebook", url: payload.facebookUrl });
        }
        if (payload.instagramUrl !== undefined) {
            const existing = socialLinks.find(s => s.platform === "instagram");
            mappedSocialLinks.push({ id: existing?.id, platform: "instagram", url: payload.instagramUrl });
        }
        if (payload.twitterUrl !== undefined) {
            const existing = socialLinks.find(s => s.platform === "twitter");
            mappedSocialLinks.push({ id: existing?.id, platform: "twitter", url: payload.twitterUrl });
        }
        if (payload.linkedinUrl !== undefined) {
            const existing = socialLinks.find(s => s.platform === "linkedin");
            mappedSocialLinks.push({ id: existing?.id, platform: "linkedin", url: payload.linkedinUrl });
        }

        if (mappedSocialLinks.length > 0) {
            updateData.socialLinks = mappedSocialLinks;
        }

        // Remove flat fields from updateData before sending to repository
        delete updateData.facebookUrl;
        delete updateData.instagramUrl;
        delete updateData.twitterUrl;
        delete updateData.linkedinUrl;

        const updated = await this.websiteRepository.updateSettings(dbSettings.id, updateData);
        return this.resolveSettingsImages(updated!);
    }

    private async resolveSettingsImages(settings: any) {
        const [whiteLogo, blackLogo, faviconLight, faviconDark, socialPreview] =
            await Promise.all([
                settings.whiteLogo ? this.resolveAttachmentUrl(settings.whiteLogo) : Promise.resolve(null),
                settings.blackLogo ? this.resolveAttachmentUrl(settings.blackLogo) : Promise.resolve(null),
                settings.faviconLight ? this.resolveAttachmentUrl(settings.faviconLight) : Promise.resolve(null),
                settings.faviconDark ? this.resolveAttachmentUrl(settings.faviconDark) : Promise.resolve(null),
                settings.socialPreview ? this.resolveAttachmentUrl(settings.socialPreview) : Promise.resolve(null),
            ]);

        const socialLinks = settings.socialLinks || [];
        const facebookUrl = socialLinks.find((s: any) => s.platform === "facebook")?.url || null;
        const instagramUrl = socialLinks.find((s: any) => s.platform === "instagram")?.url || null;
        const twitterUrl = socialLinks.find((s: any) => s.platform === "twitter")?.url || null;
        const linkedinUrl = socialLinks.find((s: any) => s.platform === "linkedin")?.url || null;

        const { socialLinks: _, ...settingsWithoutSocialLinks } = settings;

        return {
            ...settingsWithoutSocialLinks,
            whiteLogo,
            blackLogo,
            faviconLight,
            faviconDark,
            socialPreview,
            whiteLogoUrl: whiteLogo?.fileUrl || null,
            blackLogoUrl: blackLogo?.fileUrl || null,
            faviconLightUrl: faviconLight?.fileUrl || null,
            faviconDarkUrl: faviconDark?.fileUrl || null,
            socialPreviewUrl: socialPreview?.fileUrl || null,
            facebookUrl,
            instagramUrl,
            twitterUrl,
            linkedinUrl,
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
