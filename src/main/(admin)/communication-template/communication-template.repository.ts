import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { CommunicationAction, CommunicationChannel, Prisma } from "@prisma/client";

@Injectable()
export class CommunicationTemplateRepository {
    constructor(private readonly prisma: PrismaService) {}

    // ─── Templates ──────────────────────────────────────────────────────────────

    async findAllTemplates(channel?: CommunicationChannel, action?: CommunicationAction) {
        const actionOrder = [
            "OTP_LOGIN",
            "OTP_REGISTER",
            "OTP_FORGOT_PASSWORD",
            "WELCOME_PATIENT",
            "DOCTOR_CREDENTIALS",
            "CONTACT_LEAD_REPLY",
            "ORDER_CONFIRMATION",
            "PAYMENT_RECEIPT",
            "ASSESSMENT_SUBMITTED",
            "NEW_PATIENT_REGISTERED_ADMIN",
            "ASSESSMENT_APPROVED",
            "ASSESSMENT_REJECTED",
            "ASSESSMENT_REFILL_REQUEST",
            "ASSESSMENT_EDIT_SUBMITTED",
            "NEW_MESSAGE",
            "NEW_PROPOSAL",
            "PROPOSAL_ACCEPTED",
            "PROPOSAL_REJECTED",
            "SUBSCRIPTION_CANCELLED",
        ];

        const sortFn = (a: any, b: any) => {
            const indexA = actionOrder.indexOf(a.action);
            const indexB = actionOrder.indexOf(b.action);
            const posA = indexA === -1 ? 999 : indexA;
            const posB = indexB === -1 ? 999 : indexB;
            return posA - posB;
        };

        if (channel === "SMS") {
            const sms = await this.prisma.smsTemplate.findMany({
                where: action ? { action } : undefined,
            });
            return sms.sort(sortFn);
        }
        if (channel === "EMAIL") {
            const emails = await this.prisma.messageTemplate.findMany({
                where: action ? { action } : undefined,
            });
            return emails.sort(sortFn);
        }

        const emails = await this.prisma.messageTemplate.findMany({
            where: action ? { action } : undefined,
        });
        const sms = await this.prisma.smsTemplate.findMany({
            where: action ? { action } : undefined,
        });

        return [...emails.sort(sortFn), ...sms.sort(sortFn)];
    }

    async findTemplateById(id: string) {
        const msgTmpl = await this.prisma.messageTemplate.findUnique({ where: { id } });
        if (msgTmpl) return msgTmpl;

        const smsTmpl = await this.prisma.smsTemplate.findUnique({ where: { id } });
        if (smsTmpl) return smsTmpl;

        return null;
    }

    async updateTemplate(id: string, data: any) {
        delete data.action;
        delete data.channel;

        const msgTmpl = await this.prisma.messageTemplate.findUnique({ where: { id } });
        if (msgTmpl) {
            return this.prisma.messageTemplate.update({ where: { id }, data });
        }

        const smsTmpl = await this.prisma.smsTemplate.findUnique({ where: { id } });
        if (smsTmpl) {
            return this.prisma.smsTemplate.update({
                where: { id },
                data: {
                    content: data.content,
                    isActive: data.isActive,
                },
            });
        }
        return null;
    }

    // ─── Layout ─────────────────────────────────────────────────────────────────

    async getGlobalLayout() {
        return this.prisma.emailLayout.upsert({
            where: { name: "DEFAULT" },
            include: { logo: true },
            update: {},
            create: {
                name: "DEFAULT",
                isActive: true,
                logoId: null,
                isBlack: true,
                brandName: "WEIGHTLOSSMD",
                headerTitle: "System Notification",
                headerSubtitle: "We have an important update regarding your account.",
                footerCompanyName: "WeightLossMD Support",
                footerEmail: "support@weightlossmd.com",
                footerTagline: "This is an automated message. Please do not reply to this email.",
            },
        });
    }

    async updateGlobalLayout(data: Prisma.EmailLayoutUncheckedUpdateInput) {
        return this.prisma.emailLayout.upsert({
            where: { name: "DEFAULT" },
            include: { logo: true },
            update: data,
            create: {
                name: "DEFAULT",
                isActive: (data.isActive as boolean) ?? true,
                logoId: (data.logoId as string) ?? null,
                isBlack: (data.isBlack as boolean) ?? true,
                brandName: (data.brandName as string) ?? "WEIGHTLOSSMD",
                headerTitle: (data.headerTitle as string) ?? "System Notification",
                headerSubtitle:
                    (data.headerSubtitle as string) ??
                    "We have an important update regarding your account.",
                footerCompanyName: (data.footerCompanyName as string) ?? "WeightLossMD Support",
                footerEmail: (data.footerEmail as string) ?? "support@weightlossmd.com",
                footerTagline:
                    (data.footerTagline as string) ??
                    "This is an automated message. Please do not reply to this email.",
            },
        });
    }
}
