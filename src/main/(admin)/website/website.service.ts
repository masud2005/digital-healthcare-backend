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
        return settings;
    }

    async updateSettings(payload: UpdateWebsiteSettingsDto, files?: any) {
        const settings = await this.getSettings();
        const updateData: any = { ...payload };

        if (files) {
            if (files.whiteLogo?.[0]) {
                const uploaded = await this.storageService.uploadFile(files.whiteLogo[0]);
                updateData.whiteLogoUrl = uploaded.url;
            }
            if (files.blackLogo?.[0]) {
                const uploaded = await this.storageService.uploadFile(files.blackLogo[0]);
                updateData.blackLogoUrl = uploaded.url;
            }
            if (files.faviconLight?.[0]) {
                const uploaded = await this.storageService.uploadFile(files.faviconLight[0]);
                updateData.faviconLightUrl = uploaded.url;
            }
            if (files.faviconDark?.[0]) {
                const uploaded = await this.storageService.uploadFile(files.faviconDark[0]);
                updateData.faviconDarkUrl = uploaded.url;
            }
            if (files.socialPreview?.[0]) {
                const uploaded = await this.storageService.uploadFile(files.socialPreview[0]);
                updateData.socialPreviewUrl = uploaded.url;
            }
        }

        // Delete the temporary binary fields from updateData
        delete updateData.whiteLogo;
        delete updateData.blackLogo;
        delete updateData.faviconLight;
        delete updateData.faviconDark;
        delete updateData.socialPreview;

        return this.websiteRepository.updateSettings(settings.id, updateData);
    }
}
