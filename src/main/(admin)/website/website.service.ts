import { Injectable } from "@nestjs/common";
import { StorageService } from "@global/storage/storage.service";
import { WebsiteRepository } from "./website.repository";
import { UpdateWebsiteSettingsDto } from "./dto/update-website-settings.dto";

@Injectable()
export class WebsiteService {
    constructor(
        private readonly websiteRepository: WebsiteRepository,
        private readonly storageService: StorageService,
    ) {}

    async getSettings() {
        let settings = await this.websiteRepository.findSettings();
        if (!settings) {
            settings = await this.websiteRepository.createSettings({
                title: "Weight Loss MD",
            });
        }
        return this.resolveSettingsImages(settings);
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
    private async resolveSettingsImages<T extends {
        whiteLogoUrl?: string | null;
        blackLogoUrl?: string | null;
        faviconLightUrl?: string | null;
        faviconDarkUrl?: string | null;
        socialPreviewUrl?: string | null;
    }>(settings: T) {
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

