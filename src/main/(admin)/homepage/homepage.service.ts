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
        // await this.seedContent();
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

    async updateContent(payload: UpdateHomePageContentDto) {
        const content = await this.getContent();
        const updateData: any = { ...payload };

        // Clean up main images
        const attachmentFields = ["heroImageId", "heroBadgeImageId"];
        for (const field of attachmentFields) {
            const newId = payload[field as keyof UpdateHomePageContentDto];
            const oldId = content[field as keyof typeof content];
            if (newId !== undefined && newId !== oldId) {
                if (oldId && typeof oldId === "string") {
                    await this.attachmentService.remove(oldId).catch(() => {});
                }
            }
        }

        // Clean up step icons if they changed or steps were deleted
        if (payload.howItWorksSteps !== undefined && content.howItWorksSteps) {
            for (const incomingStep of payload.howItWorksSteps) {
                if (incomingStep.id) {
                    const existingStep = content.howItWorksSteps.find(s => s.id === incomingStep.id);
                    if (existingStep && incomingStep.iconId !== undefined && incomingStep.iconId !== existingStep.iconId) {
                        if (existingStep.iconId) {
                            await this.attachmentService.remove(existingStep.iconId).catch(() => {});
                        }
                    }
                }
            }
            const incomingIds = payload.howItWorksSteps.map(s => s.id).filter(Boolean);
            for (const existingStep of content.howItWorksSteps) {
                if (!incomingIds.includes(existingStep.id)) {
                    if (existingStep.iconId) {
                        await this.attachmentService.remove(existingStep.iconId).catch(() => {});
                    }
                }
            }
        }

        const updated = await this.homePageRepository.updateContent(content.id, updateData);
        return this.resolveImages(updated!);
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
