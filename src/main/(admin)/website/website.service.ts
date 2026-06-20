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
        const settings = await this.getSettings();
        const updateData: any = { ...payload };

        const attachmentFields = [
            "whiteLogoId",
            "blackLogoId",
            "faviconLightId",
            "faviconDarkId",
            "socialPreviewId",
        ];

        for (const field of attachmentFields) {
            const newId = payload[field];
            const oldId = settings[field as keyof typeof settings];
            if (newId !== undefined && newId !== oldId) {
                if (oldId && typeof oldId === "string") {
                    await this.attachmentService.remove(oldId).catch(() => {});
                }
            }
        }

        const updated = await this.websiteRepository.updateSettings(settings.id, updateData);
        return this.resolveSettingsImages(updated!);
    }

    private async resolveSettingsImages<
        T extends {
            whiteLogoId?: string | null;
            whiteLogo?: { fileUrl: string } | null;
            blackLogoId?: string | null;
            blackLogo?: { fileUrl: string } | null;
            faviconLightId?: string | null;
            faviconLight?: { fileUrl: string } | null;
            faviconDarkId?: string | null;
            faviconDark?: { fileUrl: string } | null;
            socialPreviewId?: string | null;
            socialPreview?: { fileUrl: string } | null;
        },
    >(settings: T) {
        const [whiteLogoUrl, blackLogoUrl, faviconLightUrl, faviconDarkUrl, socialPreviewUrl] =
            await Promise.all([
                settings.whiteLogo?.fileUrl
                    ? this.storageService.getSignedUrl(settings.whiteLogo.fileUrl)
                    : Promise.resolve(null),
                settings.blackLogo?.fileUrl
                    ? this.storageService.getSignedUrl(settings.blackLogo.fileUrl)
                    : Promise.resolve(null),
                settings.faviconLight?.fileUrl
                    ? this.storageService.getSignedUrl(settings.faviconLight.fileUrl)
                    : Promise.resolve(null),
                settings.faviconDark?.fileUrl
                    ? this.storageService.getSignedUrl(settings.faviconDark.fileUrl)
                    : Promise.resolve(null),
                settings.socialPreview?.fileUrl
                    ? this.storageService.getSignedUrl(settings.socialPreview.fileUrl)
                    : Promise.resolve(null),
            ]);

        return {
            ...settings,
            whiteLogoUrl,
            blackLogoUrl,
            faviconLightUrl,
            faviconDarkUrl,
            socialPreviewUrl,
        };
    }
}
