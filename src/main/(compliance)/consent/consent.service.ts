import { ExportService } from "@global/export/export.service";
import { PrismaService } from "@global/prisma/prisma.service";
import type { AuthenticatedUser } from "@main/auth/auth.types";
import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
    OnModuleInit,
} from "@nestjs/common";
import { IncidentService } from "../incident/incident.service";
import { DEFAULT_CONSENTS, generateExtraConsents } from "./consent-seed.data";
import { ConsentRepository } from "./consent.repository";
import { ConsentQueryDto } from "./dto/consent-query.dto";
import { CreateConsentDto } from "./dto/create-consent.dto";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

@Injectable()
export class ConsentService implements OnModuleInit {
    private readonly logger = new Logger(ConsentService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly consentRepository: ConsentRepository,
        private readonly exportService: ExportService,
        private readonly incidentService: IncidentService,
    ) {}

    async onModuleInit() {
        await this.seedConsents();
    }

    async seedConsents() {
        try {
            const total = await this.consentRepository.count();
            if (total > 0) return;

            this.logger.log("🌱 Seeding consents...");
            for (const c of DEFAULT_CONSENTS) {
                await this.consentRepository.create(c);
            }
            const extra = generateExtraConsents();
            for (const c of extra) {
                await this.consentRepository.create(c);
            }
            this.logger.log("✅ Consents seeded.");
        } catch (error) {
            this.logger.error("Failed to seed consents", error as Error);
        }
    }

    async create(payload: CreateConsentDto, loggedInUser?: AuthenticatedUser) {
        const userId: string | null = loggedInUser?.id ?? null;
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

    async confirmCookies(
        payload: { analytics: boolean; marketing: boolean; source?: any },
        loggedInUser?: AuthenticatedUser,
    ) {
        const userId = loggedInUser?.id ?? null;
        let userName: string | null = null;
        let email: string | null = null;

        if (userId) {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
            });
            if (user) {
                userName = user.name || null;
                email = user.email || null;
            }
        }

        const source = payload.source ?? "WEB";

        const results = await Promise.all([
            this.consentRepository.create({
                userId,
                userName,
                email,
                type: "ANALYTICS",
                status: payload.analytics ? "ACCEPTED" : "REVOKED",
                source,
            }),
            this.consentRepository.create({
                userId,
                userName,
                email,
                type: "MARKETING",
                status: payload.marketing ? "ACCEPTED" : "REVOKED",
                source,
            }),
        ]);

        return {
            analytics: results[0],
            marketing: results[1],
        };
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

    async exportCsv(
        query: Omit<ConsentQueryDto, "page" | "limit">,
        user?: AuthenticatedUser,
    ): Promise<string> {
        const { data } = await this.consentRepository.findAll({
            search: query.search?.trim(),
            role: query.role?.trim(),
            type: query.type,
            status: query.status,
            source: query.source,
            startDate: this.parseDate(query.startDate),
            endDate: this.parseDate(query.endDate),
        });

        // Trigger incident for PHI Export Event
        const reportedBy = user ? `${user.email}` : "Jessica Martinez";
        const userRole = user?.role ?? "EMPLOYEE";
        await this.incidentService
            .triggerIncident({
                type: "PHI Export Event",
                severity: "HIGH",
                reportedBy,
                affectedSystem: "Export Module",
                description: "Large PHI export detected — exceeds daily threshold",
                status: "INVESTIGATING",
                source: "SYSTEM_MONITORING",
                metadata: { userRole },
            })
            .catch((err) => {
                this.logger.error("Failed to trigger PHI Export Event incident on export", err);
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
