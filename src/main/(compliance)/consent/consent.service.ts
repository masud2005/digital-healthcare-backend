import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@global/prisma/prisma.service";
import { ExportService } from "@global/export/export.service";
import { ConsentRepository } from "./consent.repository";
import { CreateConsentDto } from "./dto/create-consent.dto";
import { ConsentQueryDto } from "./dto/consent-query.dto";
import type { AuthenticatedUser } from "@main/auth/auth.types";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

@Injectable()
export class ConsentService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly consentRepository: ConsentRepository,
        private readonly exportService: ExportService,
    ) {}

    async create(payload: CreateConsentDto, loggedInUser?: AuthenticatedUser) {
        let userId: string | null = loggedInUser?.id ?? null;
        let userName = payload.userName?.trim() || null;
        let email = payload.email?.trim() || null;

        if (userId && (!userName || !email)) {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
            });
            if (user) {
                if (!userName) userName = user.name || null;
                if (!email) email = user.email || null;
            }
        }

        return this.consentRepository.create({
            userName,
            email,
            type: payload.type,
            status: payload.status ?? "ACCEPTED",
            source: payload.source ?? "WEB",
            userId,
        });
    }

    async getStats() {
        return this.consentRepository.getStats();
    }

    async findAll(query: ConsentQueryDto) {
        const page = query.page ?? DEFAULT_PAGE;
        const limit = query.limit ?? DEFAULT_LIMIT;

        const { data, total } = await this.consentRepository.findAll({
            page,
            limit,
            search: query.search?.trim(),
            role: query.role?.trim(),
            type: query.type,
            status: query.status,
            source: query.source,
            startDate: this.parseDate(query.startDate),
            endDate: this.parseDate(query.endDate),
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
        const consent = await this.consentRepository.findById(id);
        if (!consent) {
            throw new NotFoundException("Consent record not found");
        }
        return consent;
    }

    async update(id: string, payload: Partial<CreateConsentDto>) {
        await this.findOne(id);

        return this.consentRepository.update(id, {
            userName: payload.userName?.trim(),
            email: payload.email?.trim(),
            type: payload.type,
            status: payload.status,
            source: payload.source,
        });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.consentRepository.delete(id);
    }

    async exportCsv(query: Omit<ConsentQueryDto, "page" | "limit">): Promise<string> {
        const { data } = await this.consentRepository.findAll({
            search: query.search?.trim(),
            role: query.role?.trim(),
            type: query.type,
            status: query.status,
            source: query.source,
            startDate: this.parseDate(query.startDate),
            endDate: this.parseDate(query.endDate),
        });

        const headers = [
            "ID",
            "User Name",
            "Email",
            "Consent Type",
            "Status",
            "Consent Date",
            "Source",
            "Created At",
        ];

        const rows = data.map((consent) => [
            consent.id,
            consent.userName || "",
            consent.email || "",
            consent.type,
            consent.status,
            consent.consentDate,
            consent.source,
            consent.createdAt,
        ]);

        return this.exportService.generateCsv(headers, rows);
    }

    private parseDate(dateStr?: string): Date | undefined {
        if (!dateStr) return undefined;
        const parsed = new Date(dateStr);
        if (isNaN(parsed.getTime())) {
            throw new BadRequestException(`Invalid date format: ${dateStr}`);
        }
        return parsed;
    }
}
