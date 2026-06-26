import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { StorageService } from "@global/storage/storage.service";
import { AttachmentService } from "@global/attachment/attachment.service";
import { HomePageRepository } from "./homepage.repository";
import {
    UpdateAboutSectionDto,
    UpdateAssessmentSectionDto,
    UpdateHeroSectionDto,
    UpdateHowItWorksSectionDto,
    UpdateFaqSectionDto,
    UpdateProvidersSectionDto,
    UpdateTestimonialsSectionDto,
} from "./dto/update-sections.dto";
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

    private async handleAttachmentsUpdate(
        content: any,
        payload: any,
        attachmentFieldsWithContext: Record<string, string>,
    ) {
        const updateData: any = { ...payload };

        for (const [field, context] of Object.entries(attachmentFieldsWithContext)) {
            const newId = payload[field];
            const oldId = content[field];
            if (newId !== undefined && newId !== oldId) {
                if (oldId && typeof oldId === "string") {
                    await this.attachmentService.remove(oldId).catch(() => {});
                }
                if (newId && typeof newId === "string") {
                    await this.attachmentService.replace(newId, { context: context as any }).catch(() => {});
                }
            }
        }
        return updateData;
    }

    async updateHeroSection(payload: UpdateHeroSectionDto) {
        const content = await this.getContent();
        const updateData = await this.handleAttachmentsUpdate(content, payload, {
            heroMediaId: "HERO_IMAGE",
            heroBadgeImageId: "HERO_BADGE_IMAGE",
        });

        const updated = await this.homePageRepository.updateContent(content.id, updateData);
        return this.resolveImages(updated!);
    }

    async updateAssessmentSection(payload: UpdateAssessmentSectionDto) {
        const content = await this.getContent();
        const updated = await this.homePageRepository.updateContent(content.id, payload);
        return this.resolveImages(updated!);
    }

    async updateAboutSection(payload: UpdateAboutSectionDto) {
        const content = await this.getContent();
        const updateData = await this.handleAttachmentsUpdate(content, payload, {
            aboutMediaId: "ABOUT_IMAGE",
        });

        const updated = await this.homePageRepository.updateContent(content.id, updateData);
        return this.resolveImages(updated!);
    }

    async updateProvidersSection(payload: UpdateProvidersSectionDto) {
        const content = await this.getContent();
        const updated = await this.homePageRepository.updateContent(content.id, payload);
        return this.resolveImages(updated!);
    }

    async updateHowItWorksSection(payload: UpdateHowItWorksSectionDto) {
        const content = await this.getContent();
        const updated = await this.homePageRepository.updateContent(content.id, payload);
        return this.resolveImages(updated!);
    }

    async updateTestimonialsSection(payload: UpdateTestimonialsSectionDto) {
        const content = await this.getContent();
        const updated = await this.homePageRepository.updateContent(content.id, payload);
        return this.resolveImages(updated!);
    }

    async updateFaqSection(payload: UpdateFaqSectionDto) {
        const content = await this.getContent();
        const updateData = await this.handleAttachmentsUpdate(content, payload, {
            faqCardMediaId: "FAQ_CARD_IMAGE",
        });

        const updated = await this.homePageRepository.updateContent(content.id, updateData);
        return this.resolveImages(updated!);
    }

    private async resolveImages(content: any) {
        const [heroMedia, heroBadgeImage, aboutMedia, faqCardMedia] = await Promise.all([
            content.heroMedia ? this.resolveAttachmentUrl(content.heroMedia) : Promise.resolve(null),
            content.heroBadgeImage ? this.resolveAttachmentUrl(content.heroBadgeImage) : Promise.resolve(null),
            content.aboutMedia ? this.resolveAttachmentUrl(content.aboutMedia) : Promise.resolve(null),
            content.faqCardMedia ? this.resolveAttachmentUrl(content.faqCardMedia) : Promise.resolve(null),
        ]);

        return {
            ...content,
            heroMedia,
            heroBadgeImage,
            aboutMedia,
            faqCardMedia,
            heroMediaUrl: heroMedia?.fileUrl || null,
            heroBadgeImageUrl: heroBadgeImage?.fileUrl || null,
            aboutMediaUrl: aboutMedia?.fileUrl || null,
            faqCardMediaUrl: faqCardMedia?.fileUrl || null,
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
