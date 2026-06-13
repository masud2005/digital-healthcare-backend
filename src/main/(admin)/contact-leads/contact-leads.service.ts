import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { StorageService } from "@global/storage/storage.service";
import { MailService } from "@global/mail/mail.service";
import { ExportService } from "@global/export/export.service";
import { ContactLeadsRepository } from "./contact-leads.repository";
import { ContactLeadQueryDto } from "./dto/contact-lead-query.dto";
import { CreateContactLeadDto } from "./dto/create-contact-lead.dto";
import { UpdateContactLeadDto } from "./dto/update-contact-lead.dto";
import { RespondContactLeadDto } from "./dto/respond-contact-lead.dto";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

@Injectable()
export class ContactLeadsService {
    constructor(
        private readonly contactLeadsRepository: ContactLeadsRepository,
        private readonly storageService: StorageService,
        private readonly mailService: MailService,
        private readonly exportService: ExportService,
    ) {}

    async create(payload: CreateContactLeadDto) {
        const data = this.normalizeCreatePayload(payload);

        try {
            const contactLead = await this.contactLeadsRepository.create(data);
            return this.resolveAttachment(contactLead);
        } catch (error) {
            this.throwKnownPrismaError(error);
            throw error;
        }
    }

    async findAll(query: ContactLeadQueryDto) {
        const page = query.page ?? DEFAULT_PAGE;
        const limit = query.limit ?? DEFAULT_LIMIT;

        const { data, total } = await this.contactLeadsRepository.findAll({
            page,
            limit,
            search: query.search?.trim(),
            service: query.service?.trim(),
            read: query.read,
            responded: query.responded,
        });

        return {
            data: await Promise.all(data.map((contactLead) => this.resolveAttachment(contactLead))),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async exportCsv(query: Omit<ContactLeadQueryDto, "page" | "limit">): Promise<string> {
        const leads = await this.contactLeadsRepository.findMany({
            search: query.search?.trim(),
            service: query.service?.trim(),
            read: query.read,
            responded: query.responded,
        });

        const headers = [
            "ID",
            "Full Name",
            "Email",
            "Phone Number",
            "Service",
            "Message/Comments",
            "Read Status",
            "Response Status",
            "Response Subject",
            "Response Message",
            "Responded At",
            "Created At",
        ];

        const rows = leads.map((lead) => [
            lead.id,
            lead.fullName,
            lead.email,
            lead.phone,
            lead.service,
            lead.message,
            lead.read ? "Read" : "Unread",
            lead.responded ? "Responded" : "No Response",
            lead.responseSubject,
            lead.responseMessage,
            lead.respondedAt,
            lead.createdAt,
        ]);

        return this.exportService.generateCsv(headers, rows);
    }

    async findOne(id: string) {
        const contactLead = await this.contactLeadsRepository.findById(id);

        if (!contactLead) {
            throw new NotFoundException("Contact lead not found");
        }

        return this.resolveAttachment(contactLead);
    }

    async update(id: string, payload: UpdateContactLeadDto) {
        await this.findOne(id);
        const data = this.normalizeUpdatePayload(payload);

        try {
            const contactLead = await this.contactLeadsRepository.update(id, data);
            return this.resolveAttachment(contactLead);
        } catch (error) {
            this.throwKnownPrismaError(error);
            throw error;
        }
    }

    async respond(id: string, payload: RespondContactLeadDto, file?: Express.Multer.File) {
        const lead = await this.findOne(id);

        let responseAttachments: string | null = null;
        if (file) {
            const uploaded = await this.storageService.uploadFile(file);
            responseAttachments = uploaded.key;
        }

        try {
            const contactLead = await this.contactLeadsRepository.update(id, {
                responded: true,
                respondedAt: new Date(),
                responseSubject: payload.subject,
                responseMessage: payload.message,
                responseAttachments,
            });

            await this.mailService.sendMail({
                to: lead.email,
                subject: payload.subject,
                text: payload.message,
                attachments: file ? [{
                    filename: file.originalname,
                    content: file.buffer,
                }] : undefined,
            });

            return this.resolveAttachment(contactLead);
        } catch (error) {
            this.throwKnownPrismaError(error);
            throw error;
        }
    }

    async remove(id: string) {
        await this.findOne(id);

        try {
            return await this.contactLeadsRepository.delete(id);
        } catch (error) {
            this.throwKnownPrismaError(error);
            throw error;
        }
    }

    private async resolveAttachment<T extends { attachments: string | null; responseAttachments?: string | null }>(contactLead: T) {
        return {
            ...contactLead,
            attachments: await this.storageService.resolveKey(contactLead.attachments),
            responseAttachments: await this.storageService.resolveKey(contactLead.responseAttachments),
        };
    }

    private normalizeCreatePayload(payload: CreateContactLeadDto) {
        return {
            fullName: payload.fullName.trim(),
            email: payload.email.trim().toLowerCase(),
            phone: this.parseOptionalText(payload.phone),
            service: this.parseOptionalText(payload.service),
            message: this.parseOptionalText(payload.message),
            attachments: this.parseOptionalText(payload.attachments),
        };
    }

    private normalizeUpdatePayload(payload: UpdateContactLeadDto) {
        const data: {
            fullName?: string;
            email?: string;
            phone?: string | null;
            service?: string | null;
            message?: string | null;
            read?: boolean;
            responded?: boolean;
            attachments?: string | null;
        } = {};

        if (payload.fullName !== undefined) {
            data.fullName = payload.fullName.trim();
        }

        if (payload.email !== undefined) {
            data.email = payload.email.trim().toLowerCase();
        }

        if (payload.phone !== undefined) {
            data.phone = this.parseOptionalText(payload.phone);
        }

        if (payload.service !== undefined) {
            data.service = this.parseOptionalText(payload.service);
        }

        if (payload.message !== undefined) {
            data.message = this.parseOptionalText(payload.message);
        }

        if (payload.read !== undefined) {
            data.read = payload.read;
        }

        if (payload.responded !== undefined) {
            data.responded = payload.responded;
        }

        if (payload.attachments !== undefined) {
            data.attachments = this.parseOptionalText(payload.attachments);
        }

        if (Object.keys(data).length === 0) {
            throw new BadRequestException("At least one contact lead field is required");
        }

        return data;
    }

    private parseOptionalText(value: string | null | undefined) {
        if (value === null) {
            return null;
        }

        if (value === undefined) {
            return undefined;
        }

        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
    }

    private throwKnownPrismaError(error: unknown) {
        const prismaError = error as { code?: string };

        if (prismaError.code === "P2002") {
            throw new ConflictException("Contact lead email already exists");
        }
    }
}
