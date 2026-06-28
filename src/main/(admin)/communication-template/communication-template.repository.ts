import { Injectable } from "@nestjs/common";
import { PrismaService } from "@global/prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { CommunicationChannel, CommunicationAction } from "@prisma/client";

@Injectable()
export class CommunicationTemplateRepository {
    constructor(private readonly prisma: PrismaService) {}

    // ─── Templates ──────────────────────────────────────────────────────────────

    async findAllTemplates(channel?: CommunicationChannel, action?: CommunicationAction) {
        if (channel === "SMS") {
            return this.prisma.smsTemplate.findMany({
                where: action ? { action } : undefined,
                orderBy: { createdAt: "desc" },
            });
        }
        if (channel === "EMAIL") {
            return this.prisma.messageTemplate.findMany({
                where: action ? { action } : undefined,
                orderBy: { createdAt: "desc" },
            });
        }

        const emails = await this.prisma.messageTemplate.findMany({
            where: action ? { action } : undefined,
            orderBy: { createdAt: "desc" },
        });
        const sms = await this.prisma.smsTemplate.findMany({
            where: action ? { action } : undefined,
            orderBy: { createdAt: "desc" },
        });
        return [...emails, ...sms];
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
