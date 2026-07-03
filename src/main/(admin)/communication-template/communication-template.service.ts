import { Injectable, NotFoundException } from "@nestjs/common";
import { CommunicationTemplateRepository } from "./communication-template.repository";
import { UpdateTemplateDto } from "./dto/update-template.dto";
import { UpdateLayoutDto } from "./dto/update-layout.dto";
import { StorageService } from "@global/storage/storage.service";

import { CommunicationChannel, CommunicationAction } from "@prisma/client";

@Injectable()
export class CommunicationTemplateService {
    constructor(
        private readonly templateRepository: CommunicationTemplateRepository,
        private readonly storageService: StorageService,
    ) {}

    async findAllTemplates(channel?: CommunicationChannel, action?: CommunicationAction) {
        const data = await this.templateRepository.findAllTemplates(channel, action);
        return {
            success: true,
            statusCode: 200,
            message: "Templates fetched successfully",
            data,
        };
    }

    async findTemplate(id: string) {
        const template = await this.templateRepository.findTemplateById(id);
        if (!template) {
            throw new NotFoundException("Template not found");
        }
        return {
            success: true,
            statusCode: 200,
            message: "Template fetched successfully",
            data: template,
        };
    }

    async updateTemplate(id: string, payload: UpdateTemplateDto) {
        const template = await this.templateRepository.findTemplateById(id);
        if (!template) {
            throw new NotFoundException("Template not found");
        }
        const updated = await this.templateRepository.updateTemplate(id, payload);
        return {
            success: true,
            statusCode: 200,
            message: "Template updated successfully",
            data: updated,
        };
    }

    async getGlobalLayout() {
        const layout = await this.templateRepository.getGlobalLayout();
        if (layout?.logo?.fileUrl) {
            layout.logo.fileUrl = await this.storageService.getSignedUrl(layout.logo.fileUrl);
        }
        return {
            success: true,
            statusCode: 200,
            message: "Global layout fetched successfully",
            data: layout,
        };
    }

    async updateGlobalLayout(payload: UpdateLayoutDto) {
        const layout = await this.templateRepository.updateGlobalLayout(payload);
        if (layout?.logo?.fileUrl) {
            layout.logo.fileUrl = await this.storageService.getSignedUrl(layout.logo.fileUrl);
        }
        return {
            success: true,
            statusCode: 200,
            message: "Global layout updated successfully",
            data: layout,
        };
    }

    getTemplateVariables(channel?: CommunicationChannel, action?: CommunicationAction) {
        let variables: Record<string, string[]> = {
            OTP_LOGIN: ["name", "code"],
            OTP_REGISTER: ["name", "code"],
            OTP_FORGOT_PASSWORD: ["name", "code"],
            DOCTOR_CREDENTIALS: ["name", "email", "password"],
            CONTACT_LEAD_REPLY: ["name", "subject", "message"],
            ORDER_CONFIRMATION: ["name", "orderId", "amount", "items"],
            PAYMENT_RECEIPT: ["name", "orderId", "amount"],
            ASSESSMENT_SUBMITTED: ["name"],
            WELCOME_PATIENT: ["name"],
            NEW_PATIENT_REGISTERED_ADMIN: ["name"],
            ASSESSMENT_APPROVED: ["name"],
            ASSESSMENT_REJECTED: ["name"],
            ASSESSMENT_REFILL_REQUEST: ["name"],
            ASSESSMENT_EDIT_SUBMITTED: ["doctorName", "name"],
            NEW_MESSAGE: ["name", "senderName"],
            NEW_PROPOSAL: ["name", "senderName"],
            PROPOSAL_ACCEPTED: ["name"],
            PROPOSAL_REJECTED: ["name"],
            SUBSCRIPTION_CANCELLED: ["name", "serviceName"],
        };

        if (channel === "SMS") {
            variables = {
                OTP_LOGIN: ["code"],
                OTP_REGISTER: ["code"],
                OTP_FORGOT_PASSWORD: ["code"],
            };
        }

        if (action) {
            variables = {
                [action]: variables[action] || [],
            };
        }

        return {
            success: true,
            statusCode: 200,
            message: "Template variables fetched successfully",
            data: variables,
        };
    }
}
