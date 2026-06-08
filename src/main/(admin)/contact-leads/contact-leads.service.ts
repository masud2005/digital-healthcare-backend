import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { ContactLeadsRepository } from "./contact-leads.repository";
import { ContactLeadQueryDto } from "./dto/contact-lead-query.dto";
import { CreateContactLeadDto } from "./dto/create-contact-lead.dto";
import { UpdateContactLeadDto } from "./dto/update-contact-lead.dto";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

@Injectable()
export class ContactLeadsService {
    constructor(private readonly contactLeadsRepository: ContactLeadsRepository) {}

    async create(payload: CreateContactLeadDto) {
        const data = this.normalizeCreatePayload(payload);
        await this.ensureEmailIsAvailable(data.email);

        try {
            return await this.contactLeadsRepository.create(data);
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
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const contactLead = await this.contactLeadsRepository.findById(id);

        if (!contactLead) {
            throw new NotFoundException("Contact lead not found");
        }

        return contactLead;
    }

    async update(id: string, payload: UpdateContactLeadDto) {
        await this.findOne(id);
        const data = this.normalizeUpdatePayload(payload);

        if (data.email) {
            await this.ensureEmailIsAvailable(data.email, id);
        }

        try {
            return await this.contactLeadsRepository.update(id, data);
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

    private async ensureEmailIsAvailable(email: string, excludeId?: string) {
        const existingContactLead = await this.contactLeadsRepository.findByEmail(email);

        if (existingContactLead && existingContactLead.id !== excludeId) {
            throw new ConflictException("Contact lead email already exists");
        }
    }

    private throwKnownPrismaError(error: unknown) {
        const prismaError = error as { code?: string };

        if (prismaError.code === "P2002") {
            throw new ConflictException("Contact lead email already exists");
        }
    }
}
