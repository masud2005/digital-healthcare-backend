import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { StorageService } from "@global/storage/storage.service";
import { HomePageRepository } from "./homepage.repository";
import { UpdateHomePageContentDto } from "./dto/update-homepage.dto";
import { DEFAULT_HOMEPAGE_CONTENT } from "./homepage-seed.data";

@Injectable()
export class HomePageService implements OnModuleInit {
    private readonly logger = new Logger(HomePageService.name);

    constructor(
        private readonly homePageRepository: HomePageRepository,
        private readonly storageService: StorageService,
    ) {}

    async onModuleInit() {
        await this.seedContent();
    }

    async seedContent() {
        try {
            const content = await this.homePageRepository.findContent();
            if (content) return;

            this.logger.log("🌱 Seeding homepage content...");
            await this.homePageRepository.createContent(DEFAULT_HOMEPAGE_CONTENT);
            this.logger.log("✅ Homepage content successfully seeded.");
        } catch (error) {
            this.logger.error("Failed to seed homepage content", error as Error);
        }
    }

    async getContent() {
        let content = await this.homePageRepository.findContent();
        if (!content) {
            await this.seedContent();
            content = await this.homePageRepository.findContent();
        }
        return this.resolveImages(content!);
    }

    async updateContent(payload: UpdateHomePageContentDto, files?: any) {
        const content = await this.getContent();
        const updateData: any = { ...payload };

        if (files) {
            if (files.heroImage?.[0]) {
                const uploaded = await this.storageService.uploadFile(files.heroImage[0]);
                updateData.heroImageUrl = uploaded.key;
            }
            if (files.heroBadgeImage?.[0]) {
                const uploaded = await this.storageService.uploadFile(files.heroBadgeImage[0]);
                updateData.heroBadgeImageUrl = uploaded.key;
            }
        }

        // Remove multipart binary fields
        delete updateData.heroImage;
        delete updateData.heroBadgeImage;

        const updated = await this.homePageRepository.updateContent(content.id, updateData);
        return this.resolveImages(updated!);
    }

    private async resolveImages<
        T extends {
            heroImageUrl?: string | null;
            heroBadgeImageUrl?: string | null;
        },
    >(content: T) {
        const [heroImageUrl, heroBadgeImageUrl] = await Promise.all([
            this.storageService.resolveKey(content.heroImageUrl),
            this.storageService.resolveKey(content.heroBadgeImageUrl),
        ]);

        return { ...content, heroImageUrl, heroBadgeImageUrl };
    }
}
