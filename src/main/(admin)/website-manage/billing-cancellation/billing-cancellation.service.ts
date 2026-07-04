import { Injectable } from "@nestjs/common";
import { BillingCancellationRepository } from "./billing-cancellation.repository";
import { UpdateBillingCancellationDto } from "./dto/update-billing-cancellation.dto";

@Injectable()
export class BillingCancellationService {
    constructor(private readonly repository: BillingCancellationRepository) {}

    async get() {
        let record = await this.repository.findFirst();

        if (!record) {
            record = await this.repository.create({
                timelineTitle: "Billing Timeline",
                timelineSteps: [
                    { step: "Day 1", description: "Enrollment charged" },
                    { step: "Day 1-3", description: "Provider review begins" },
                    { step: "Day 3-7", description: "Rx sent to pharmacy" },
                    { step: "Billing Monthly", description: "Flexible Auto-renewal billing" },
                ] as any,
                timelineDisclaimerTitle: "Auto-Renewal Policy",
                timelineDisclaimerDescription: "Your membership automatically renews on a monthly basis until cancelled. You will receive a reminder email 5 days before each renewal. You can cancel at any time before the renewal date through your account settings or by contacting our support team. Cancellation takes effect at the end of your current billing cycle.",

                cancelTitle: "Cancellation Process",
                cancelDescription: "Simple, no-questions-asked cancellation",
                cancelSteps: [
                    "Log in to your WeightLossMD account",
                    "Navigate to \"Approved Consultation\"",
                    "Open a consultation > click \"Cancel Treatment\" and confirm your choice",
                    "Receive email confirmation within minutes",
                    "Access continues until end of billing period",
                ] as any,

                refundEligibleTitle: "Eligible for Refund",
                refundEligibleConditions: [
                    "Medical ineligibility determined within 30 days with no medication received",
                    "Billing errors or duplicate charges",
                    "Technical issues preventing access to care",
                ] as any,

                refundNotEligibleTitle: "Not Eligible for Refund",
                refundNotEligibleConditions: [
                    "Unused days in a billing period after cancellation",
                    "Medication already dispensed by pharmacy",
                    "Provider consultations already completed",
                ] as any,

                faqTitle: "Billing & Cancellation FAQ",
                faqs: [
                    {
                        question: "Can I cancel anytime?",
                        answer: "Yes, you can cancel at any time.",
                    },
                ] as any,
            });
        }

        return {
            success: true,
            message: "Billing & Cancellation content retrieved successfully",
            data: record,
        };
    }

    async update(dto: UpdateBillingCancellationDto) {
        let record = await this.repository.findFirst();

        const data: any = {
            ...dto,
            timelineSteps: dto.timelineSteps ? (dto.timelineSteps as any) : undefined,
            cancelSteps: dto.cancelSteps ? (dto.cancelSteps as any) : undefined,
            refundEligibleConditions: dto.refundEligibleConditions ? (dto.refundEligibleConditions as any) : undefined,
            refundNotEligibleConditions: dto.refundNotEligibleConditions ? (dto.refundNotEligibleConditions as any) : undefined,
            faqs: dto.faqs ? (dto.faqs as any) : undefined,
        };

        if (!record) {
            record = await this.repository.create({
                timelineTitle: dto.timelineTitle || "Billing Timeline",
                timelineSteps: dto.timelineSteps ? (dto.timelineSteps as any) : [
                    { step: "Day 1", description: "Enrollment charged" },
                ],
                timelineDisclaimerTitle: dto.timelineDisclaimerTitle || "Auto-Renewal Policy",
                timelineDisclaimerDescription: dto.timelineDisclaimerDescription || "Your membership automatically renews on a monthly basis until cancelled.",

                cancelTitle: dto.cancelTitle || "Cancellation Process",
                cancelDescription: dto.cancelDescription || "Simple, no-questions-asked cancellation",
                cancelSteps: dto.cancelSteps ? (dto.cancelSteps as any) : [
                    "Log in to your WeightLossMD account",
                ],

                refundEligibleTitle: dto.refundEligibleTitle || "Eligible for Refund",
                refundEligibleConditions: dto.refundEligibleConditions ? (dto.refundEligibleConditions as any) : [
                    "Medical ineligibility determined within 30 days with no medication received",
                ],

                refundNotEligibleTitle: dto.refundNotEligibleTitle || "Not Eligible for Refund",
                refundNotEligibleConditions: dto.refundNotEligibleConditions ? (dto.refundNotEligibleConditions as any) : [
                    "Medication already dispensed by pharmacy",
                ],

                faqTitle: dto.faqTitle || "Billing & Cancellation FAQ",
                faqs: dto.faqs ? (dto.faqs as any) : [
                    {
                        question: "Can I cancel anytime?",
                        answer: "Yes, you can cancel at any time.",
                    },
                ],
            });
        } else {
            record = await this.repository.update(record.id, data);
        }

        return {
            success: true,
            message: "Billing & Cancellation content updated successfully",
            data: record,
        };
    }
}
