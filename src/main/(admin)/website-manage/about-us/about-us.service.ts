import { Injectable } from "@nestjs/common";
import { StorageService } from "@global/storage/storage.service";
import { AboutUsRepository } from "./about-us.repository";
import { UpdateAboutUsDto } from "./dto/update-about-us.dto";

@Injectable()
export class AboutUsService {
    constructor(
        private readonly aboutUsRepository: AboutUsRepository,
        private readonly storageService: StorageService,
    ) {}

    async get() {
        let record = await this.aboutUsRepository.findFirst();

        if (!record) {
            record = await this.aboutUsRepository.create({
                heroTitle: "About Our Clinic",
                heroDescription: "We are dedicated to providing the best healthcare services.",
                heroButtonText: "Learn More",
                heroButtonUrl: "/services",
                heroTargetBlank: true,

                bodySection1Title: "Our Mission",
                bodySection1Description: "To deliver high-quality, compassionate care to every patient.",
                bodySection1ButtonText: "Read Mission",
                bodySection1ButtonUrl: "/mission",
                bodySection1TargetBlank: true,

                bodySection2Tag: "VISION",
                bodySection2Title: "Our Vision",
                bodySection2Description: "To lead the transition to digital-first healthcare solutions.",
                bodySection2ButtonText: "Read Vision",
                bodySection2ButtonUrl: "/vision",
                bodySection2TargetBlank: true,

                bodySection3Tag: "STORY",
                bodySection3Title: "Our Journey",
                bodySection3Description: "How we started and where we are today.",
                bodySection3Points: ["Founded in 2020", "Served over 10,000 patients", "24/7 care support team"],
                bodySection3ButtonText: "Read Story",
                bodySection3ButtonUrl: "/story",
                bodySection3TargetBlank: true,

                faqSectionTitle: "Frequently Asked Questions",
                faqCardTitle: "Need Help?",
                faqCardDescription: "Here are some of the most common questions we receive.",
                faqButtonText: "Contact Us",
                faqButtonUrl: "/contact",
                faqTargetBlank: true,
                faqs: [
                    {
                        question: "What are your operating hours?",
                        answer: "We are available 24/7 online.",
                    },
                ],
            });
        }

        return {
            success: true,
            message: "About Us content retrieved successfully",
            data: await this.resolveRecordUrls(record),
        };
    }

    private async resolveRecordUrls(record: any) {
        if (!record) return record;
        const resolved = { ...record };
        const imageFields = [
            "bodySection1Image",
            "bodySection2Image",
            "bodySection3Image",
            "faqCardImage",
        ];
        for (const field of imageFields) {
            if (resolved[field]?.fileUrl) {
                resolved[field] = {
                    ...resolved[field],
                    fileUrl: await this.storageService.getSignedUrl(resolved[field].fileUrl),
                };
            }
        }
        return resolved;
    }

    async update(dto: UpdateAboutUsDto) {
        let record = await this.aboutUsRepository.findFirst();

        const data: any = {
            ...dto,
            bodySection3Points: dto.bodySection3Points ? (dto.bodySection3Points as any) : undefined,
            faqs: dto.faqs ? (dto.faqs as any) : undefined,
        };

        if (!record) {
            // Provide default fallback values if creating for first time during update
            record = await this.aboutUsRepository.create({
                heroTitle: dto.heroTitle || "About Our Clinic",
                heroDescription: dto.heroDescription || "We are dedicated to providing the best healthcare services.",
                heroButtonText: dto.heroButtonText || "Learn More",
                heroButtonUrl: dto.heroButtonUrl || "/services",
                heroTargetBlank: dto.heroTargetBlank !== undefined ? dto.heroTargetBlank : true,

                bodySection1Title: dto.bodySection1Title || "Our Mission",
                bodySection1Description: dto.bodySection1Description || "To deliver high-quality, compassionate care to every patient.",
                bodySection1ButtonText: dto.bodySection1ButtonText || "Read Mission",
                bodySection1ButtonUrl: dto.bodySection1ButtonUrl || "/mission",
                bodySection1TargetBlank: dto.bodySection1TargetBlank !== undefined ? dto.bodySection1TargetBlank : true,
                bodySection1ImageId: dto.bodySection1ImageId,

                bodySection2Tag: dto.bodySection2Tag || "VISION",
                bodySection2Title: dto.bodySection2Title || "Our Vision",
                bodySection2Description: dto.bodySection2Description || "To lead the transition to digital-first healthcare solutions.",
                bodySection2ButtonText: dto.bodySection2ButtonText || "Read Vision",
                bodySection2ButtonUrl: dto.bodySection2ButtonUrl || "/vision",
                bodySection2TargetBlank: dto.bodySection2TargetBlank !== undefined ? dto.bodySection2TargetBlank : true,
                bodySection2ImageId: dto.bodySection2ImageId,

                bodySection3Tag: dto.bodySection3Tag || "STORY",
                bodySection3Title: dto.bodySection3Title || "Our Journey",
                bodySection3Description: dto.bodySection3Description || "How we started and where we are today.",
                bodySection3Points: dto.bodySection3Points ? (dto.bodySection3Points as any) : ["Founded in 2020", "Served over 10,000 patients", "24/7 care support team"],
                bodySection3ButtonText: dto.bodySection3ButtonText || "Read Story",
                bodySection3ButtonUrl: dto.bodySection3ButtonUrl || "/story",
                bodySection3TargetBlank: dto.bodySection3TargetBlank !== undefined ? dto.bodySection3TargetBlank : true,
                bodySection3ImageId: dto.bodySection3ImageId,

                faqSectionTitle: dto.faqSectionTitle || "Frequently Asked Questions",
                faqCardTitle: dto.faqCardTitle || "Need Help?",
                faqCardDescription: dto.faqCardDescription || "Here are some of the most common questions we receive.",
                faqButtonText: dto.faqButtonText || "Contact Us",
                faqButtonUrl: dto.faqButtonUrl || "/contact",
                faqTargetBlank: dto.faqTargetBlank !== undefined ? dto.faqTargetBlank : true,
                faqCardImageId: dto.faqCardImageId,
                faqs: dto.faqs ? (dto.faqs as any) : [
                    {
                        question: "What are your operating hours?",
                        answer: "We are available 24/7 online.",
                    },
                ],
            });
        } else {
            record = await this.aboutUsRepository.update(record.id, data);
        }

        return {
            success: true,
            message: "About Us content updated successfully",
            data: await this.resolveRecordUrls(record),
        };
    }
}
