import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { StorageService } from "@global/storage/storage.service";
import { AttachmentService } from "@global/attachment/attachment.service";
import { HomePageRepository } from "./homepage.repository";
import { UpdateHomePageContentDto } from "./dto/update-homepage.dto";
import { DEFAULT_HOMEPAGE_CONTENT } from "./homepage-seed.data";

@Injectable()
export class HomePageService implements OnModuleInit {
    private readonly logger = new Logger(HomePageService.name);

    constructor(
        private readonly homePageRepository: HomePageRepository,
        private readonly storageService: StorageService,
        private readonly attachmentService: AttachmentService,
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
                const attachmentId = await this.uploadAttachment(files.heroImage[0], "HERO_IMAGE");
                updateData.heroImageId = attachmentId;
                if (content.heroImageId) {
                    await this.attachmentService.remove(content.heroImageId).catch(() => {});
                }
            }
            if (files.heroBadgeImage?.[0]) {
                const attachmentId = await this.uploadAttachment(
                    files.heroBadgeImage[0],
                    "HERO_BADGE_IMAGE",
                );
                updateData.heroBadgeImageId = attachmentId;
                if (content.heroBadgeImageId) {
                    await this.attachmentService.remove(content.heroBadgeImageId).catch(() => {});
                }
            }
        }

        // Remove multipart binary fields
        delete updateData.heroImage;
        delete updateData.heroBadgeImage;

        const updated = await this.homePageRepository.updateContent(content.id, updateData);
        return this.resolveImages(updated!);
    }

    private async uploadAttachment(file: Express.Multer.File, context: any) {
        const res = await this.attachmentService.upload([file], { context });
        // The data property contains the created attachment record or records.
        // In the upload method, single file upload returns:
        // { success: true, message: ..., data: resolvedAttachment }
        // where data is the attachment object itself.
        if (Array.isArray(res.data)) {
            return res.data[0].id;
        }
        return (res.data as any).id;
    }

    private async resolveImages<
        T extends {
            heroImageId?: string | null;
            heroImage?: { fileUrl: string } | null;
            heroBadgeImageId?: string | null;
            heroBadgeImage?: { fileUrl: string } | null;
            howItWorksSteps?: any[] | null;
        },
    >(content: T) {
        const [heroImageUrl, heroBadgeImageUrl] = await Promise.all([
            content.heroImage?.fileUrl
                ? this.storageService.getSignedUrl(content.heroImage.fileUrl)
                : Promise.resolve(null),
            content.heroBadgeImage?.fileUrl
                ? this.storageService.getSignedUrl(content.heroBadgeImage.fileUrl)
                : Promise.resolve(null),
        ]);

        let resolvedSteps = content.howItWorksSteps;
        if (Array.isArray(resolvedSteps)) {
            resolvedSteps = await Promise.all(
                resolvedSteps.map(async (step) => {
                    const iconUrl = step.icon?.fileUrl
                        ? await this.storageService.getSignedUrl(step.icon.fileUrl)
                        : null;
                    return {
                        ...step,
                        iconUrl,
                    };
                }),
            );
        }

        return {
            ...content,
            heroImageUrl,
            heroBadgeImageUrl,
            howItWorksSteps: resolvedSteps,
        };
    }
}
