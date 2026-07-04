import { Injectable } from "@nestjs/common";
import { EligibilityRepository } from "./eligibility.repository";
import { UpdateEligibilityDto } from "./dto/update-eligibility.dto";

@Injectable()
export class EligibilityService {
    constructor(private readonly eligibilityRepository: EligibilityRepository) {}

    async get() {
        let record = await this.eligibilityRepository.findFirst();

        if (!record) {
            record = await this.eligibilityRepository.create({
                generalTitle: "General Eligibility Criteria",
                generalPoints: [
                    {
                        point: "Must be 18 years or older",
                        status: true,
                    },
                ] as any,
                generalBottomDesc: "Please review all criteria before signing up.",

                qualificationTitle: "Qualification Criteria",
                qualificationbmi27Text: "BMI >= 27",
                qualification27Description: "With at least one weight-related condition.",
                qualificationbmi30Text: "BMI >= 30",
                qualification30Description: "Regardless of other conditions.",

                weightConditionSecTitle: "Who Can/Cannot Service",
                weightConditions: ["Florida", "New York"] as any,

                contraindicationsSectionTitle: "Contraindications",
                contraindicationsSectionWrite: ["History of medullary thyroid carcinoma"] as any,

                requiredlabWorkSectionTitle: "Required Lab Work",
                requiredlabWorkSectionContraindications: ["Bariatric surgery"] as any,

                ongoingMonitoringSectionTitle: "Ongoing Monitoring",
                ongoingMonitoringSectionContraindication: ["Currently taking Semaglutide"] as any,

                disclaimerSectionTitle: "Medical Disclaimer",
                disclaimerSectionDes: "All assessments are subject to medical provider approval.",

                faqTitle: "Eligibility FAQ",
                faqs: [
                    {
                        question: "Can I participate?",
                        answer: "Yes, if you meet the criteria.",
                    },
                ] as any,
            });
        }

        return {
            success: true,
            message: "Eligibility content retrieved successfully",
            data: record,
        };
    }

    async update(dto: UpdateEligibilityDto) {
        let record = await this.eligibilityRepository.findFirst();

        const data: any = {
            ...dto,
            generalPoints: dto.generalPoints ? (dto.generalPoints as any) : undefined,
            weightConditions: dto.weightConditions ? (dto.weightConditions as any) : undefined,
            contraindicationsSectionWrite: dto.contraindicationsSectionWrite ? (dto.contraindicationsSectionWrite as any) : undefined,
            requiredlabWorkSectionContraindications: dto.requiredlabWorkSectionContraindications ? (dto.requiredlabWorkSectionContraindications as any) : undefined,
            ongoingMonitoringSectionContraindication: dto.ongoingMonitoringSectionContraindication ? (dto.ongoingMonitoringSectionContraindication as any) : undefined,
            faqs: dto.faqs ? (dto.faqs as any) : undefined,
        };

        if (!record) {
            record = await this.eligibilityRepository.create({
                generalTitle: dto.generalTitle || "General Eligibility Criteria",
                generalPoints: dto.generalPoints ? (dto.generalPoints as any) : [
                    {
                        point: "Must be 18 years or older",
                        status: true,
                    },
                ],
                generalBottomDesc: dto.generalBottomDesc || "Please review all criteria before signing up.",

                qualificationTitle: dto.qualificationTitle || "Qualification Criteria",
                qualificationbmi27Text: dto.qualificationbmi27Text || "BMI >= 27",
                qualification27Description: dto.qualification27Description || "With at least one weight-related condition.",
                qualificationbmi30Text: dto.qualificationbmi30Text || "BMI >= 30",
                qualification30Description: dto.qualification30Description || "Regardless of other conditions.",

                weightConditionSecTitle: dto.weightConditionSecTitle || "Who Can/Cannot Service",
                weightConditions: dto.weightConditions ? (dto.weightConditions as any) : ["Florida", "New York"],

                contraindicationsSectionTitle: dto.contraindicationsSectionTitle || "Contraindications",
                contraindicationsSectionWrite: dto.contraindicationsSectionWrite ? (dto.contraindicationsSectionWrite as any) : ["History of medullary thyroid carcinoma"],

                requiredlabWorkSectionTitle: dto.requiredlabWorkSectionTitle || "Required Lab Work",
                requiredlabWorkSectionContraindications: dto.requiredlabWorkSectionContraindications ? (dto.requiredlabWorkSectionContraindications as any) : ["Bariatric surgery"],

                ongoingMonitoringSectionTitle: dto.ongoingMonitoringSectionTitle || "Ongoing Monitoring",
                ongoingMonitoringSectionContraindication: dto.ongoingMonitoringSectionContraindication ? (dto.ongoingMonitoringSectionContraindication as any) : ["Currently taking Semaglutide"],

                disclaimerSectionTitle: dto.disclaimerSectionTitle || "Medical Disclaimer",
                disclaimerSectionDes: dto.disclaimerSectionDes || "All assessments are subject to medical provider approval.",

                faqTitle: dto.faqTitle || "Eligibility FAQ",
                faqs: dto.faqs ? (dto.faqs as any) : [
                    {
                        question: "Can I participate?",
                        answer: "Yes, if you meet the criteria.",
                    },
                ],
            });
        } else {
            record = await this.eligibilityRepository.update(record.id, data);
        }

        return {
            success: true,
            message: "Eligibility content updated successfully",
            data: record,
        };
    }
}
