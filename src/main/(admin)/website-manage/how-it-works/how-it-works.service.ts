import { Injectable } from "@nestjs/common";
import { HowItWorksRepository } from "./how-it-works.repository";
import { UpdateHowItWorksDto } from "./dto/update-how-it-works.dto";

@Injectable()
export class HowItWorksService {
    constructor(private readonly howItWorksRepository: HowItWorksRepository) {}

    async get() {
        let record = await this.howItWorksRepository.findFirst();

        if (!record) {
            record = await this.howItWorksRepository.create({
                sectionTitle: "How WeightLossMD Works",
                sectionDescription: "Simple steps to start your weight loss journey.",
                steps: [
                    {
                        title: "Step 1",
                        timeline: "10 mins",
                        description: "Complete medical assessment.",
                    },
                ] as any,
                disclaimerTitle: "Medical Disclaimer",
                disclaimerDescription:
                    "All consultations and prescriptions are subject to medical evaluation.",
                faqSectionTitle: "Frequently Asked Questions",
                faqs: [
                    {
                        question: "Is this covered by insurance?",
                        answer: "No, we are a cash-pay service.",
                    },
                ] as any,
            });
        }

        return {
            success: true,
            message: "How It Works content retrieved successfully",
            data: record,
        };
    }

    async update(dto: UpdateHowItWorksDto) {
        let record = await this.howItWorksRepository.findFirst();

        const data: any = {
            ...dto,
            steps: dto.steps ? (dto.steps as any) : undefined,
            faqs: dto.faqs ? (dto.faqs as any) : undefined,
        };

        if (!record) {
            record = await this.howItWorksRepository.create({
                sectionTitle: dto.sectionTitle || "How WeightLossMD Works",
                sectionDescription:
                    dto.sectionDescription || "Simple steps to start your weight loss journey.",
                steps: dto.steps
                    ? (dto.steps as any)
                    : [
                          {
                              title: "Step 1",
                              timeline: "10 mins",
                              description: "Complete medical assessment.",
                          },
                      ],
                disclaimerTitle: dto.disclaimerTitle || "Medical Disclaimer",
                disclaimerDescription:
                    dto.disclaimerDescription ||
                    "All consultations and prescriptions are subject to medical evaluation.",
                faqSectionTitle: dto.faqSectionTitle || "Frequently Asked Questions",
                faqs: dto.faqs
                    ? (dto.faqs as any)
                    : [
                          {
                              question: "Is this covered by insurance?",
                              answer: "No, we are a cash-pay service.",
                          },
                      ],
            });
        } else {
            record = await this.howItWorksRepository.update(record.id, data);
        }

        return {
            success: true,
            message: "How It Works content updated successfully",
            data: record,
        };
    }
}
