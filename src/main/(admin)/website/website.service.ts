import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { StorageService } from "@global/storage/storage.service";
import { WebsiteRepository } from "./website.repository";
import { UpdateWebsiteSettingsDto } from "./dto/update-website-settings.dto";
import { DEFAULT_WEBSITE_SETTINGS } from "./website-seed.data";

@Injectable()
export class WebsiteService implements OnModuleInit {
    private readonly logger = new Logger(WebsiteService.name);

    constructor(
        private readonly websiteRepository: WebsiteRepository,
        private readonly storageService: StorageService,
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

    async updateSettings(payload: UpdateWebsiteSettingsDto, files?: any) {
        // getSettings() guarantees a record exists (creates one if missing)
        const settings = await this.getSettings();
        const updateData: any = { ...payload };

        if (files) {
            if (files.whiteLogo?.[0]) {
                const uploaded = await this.storageService.uploadFile(files.whiteLogo[0]);
                updateData.whiteLogoUrl = uploaded.key;
            }
            if (files.blackLogo?.[0]) {
                const uploaded = await this.storageService.uploadFile(files.blackLogo[0]);
                updateData.blackLogoUrl = uploaded.key;
            }
            if (files.faviconLight?.[0]) {
                const uploaded = await this.storageService.uploadFile(files.faviconLight[0]);
                updateData.faviconLightUrl = uploaded.key;
            }
            if (files.faviconDark?.[0]) {
                const uploaded = await this.storageService.uploadFile(files.faviconDark[0]);
                updateData.faviconDarkUrl = uploaded.key;
            }
            if (files.socialPreview?.[0]) {
                const uploaded = await this.storageService.uploadFile(files.socialPreview[0]);
                updateData.socialPreviewUrl = uploaded.key;
            }
        }

        // Remove multipart binary fields from the payload before saving
        delete updateData.whiteLogo;
        delete updateData.blackLogo;
        delete updateData.faviconLight;
        delete updateData.faviconDark;
        delete updateData.socialPreview;

        const updated = await this.websiteRepository.updateSettings(settings.id, updateData);
        return this.resolveSettingsImages(updated!);
    }

    /**
     * Replace stored asset keys with fresh signed URLs.
     * The DB always holds raw keys; callers always receive live URLs.
     */
    private async resolveSettingsImages<
        T extends {
            whiteLogoUrl?: string | null;
            blackLogoUrl?: string | null;
            faviconLightUrl?: string | null;
            faviconDarkUrl?: string | null;
            socialPreviewUrl?: string | null;
        },
    >(settings: T) {
        const [whiteLogoUrl, blackLogoUrl, faviconLightUrl, faviconDarkUrl, socialPreviewUrl] =
            await Promise.all([
                this.storageService.resolveKey(settings.whiteLogoUrl),
                this.storageService.resolveKey(settings.blackLogoUrl),
                this.storageService.resolveKey(settings.faviconLightUrl),
                this.storageService.resolveKey(settings.faviconDarkUrl),
                this.storageService.resolveKey(settings.socialPreviewUrl),
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
