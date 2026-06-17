import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
    OnModuleInit,
} from "@nestjs/common";
import { ExportService } from "@global/export/export.service";
import { ProviderLicenseRepository } from "./provider-license.repository";
import { CreateProviderLicenseDto } from "./dto/create-provider-license.dto";
import { UpdateProviderLicenseDto } from "./dto/update-provider-license.dto";
import { ProviderLicenseQueryDto } from "./dto/provider-license-query.dto";
import { DEFAULT_PROVIDER_LICENSES } from "./provider-license-seed.data";
import { IncidentService } from "../incident/incident.service";
import type { AuthenticatedUser } from "@main/auth/auth.types";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

@Injectable()
export class ProviderLicenseService implements OnModuleInit {
    private readonly logger = new Logger(ProviderLicenseService.name);

    constructor(
        private readonly providerLicenseRepository: ProviderLicenseRepository,
        private readonly exportService: ExportService,
        private readonly incidentService: IncidentService,
    ) {}

    async onModuleInit() {
        // await this.seedProviderLicenses();
    }

    async seedProviderLicenses() {
        try {
            const stats = await this.providerLicenseRepository.getStats();
            if (stats.total > 0) return;

            this.logger.log("🌱 Seeding provider licenses...");
            for (const license of DEFAULT_PROVIDER_LICENSES) {
                await this.providerLicenseRepository.create(license);
            }
            this.logger.log("✅ Provider licenses seeded.");
        } catch (error) {
            this.logger.error("Failed to seed provider licenses", error as Error);
        }
    }

    async create(payload: CreateProviderLicenseDto) {
        return this.providerLicenseRepository.create({
            doctorId: payload.doctorId ?? null,
            doctorName: payload.doctorName.trim(),
            doctorEmail: payload.doctorEmail?.trim() ?? null,
            avatarColor: payload.avatarColor?.trim() ?? null,
            npiNumber: this.parseOptionalText(payload.npiNumber),
            deaNumber: this.parseOptionalText(payload.deaNumber),
            licenseNumber: this.parseOptionalText(payload.licenseNumber),
            licenseType: this.parseOptionalText(payload.licenseType),
            licenseStates: payload.licenseStates?.map((s) => s.trim().toUpperCase()),
            licenseSource: payload.licenseSource,
            licenseStatus: payload.licenseStatus,
            licenseExpiresAt: payload.licenseExpiresAt ?? null,
            insuranceProvider: this.parseOptionalText(payload.insuranceProvider),
            insuranceStatus: payload.insuranceStatus,
            insuranceExpiresAt: payload.insuranceExpiresAt ?? null,
            notes: this.parseOptionalText(payload.notes),
            isActive: payload.isActive ?? true,
        });
    }

    async getStats() {
        return this.providerLicenseRepository.getStats();
    }

    async findAll(query: ProviderLicenseQueryDto) {
        const page = query.page ?? DEFAULT_PAGE;
        const limit = query.limit ?? DEFAULT_LIMIT;

        const { data, total } = await this.providerLicenseRepository.findAll({
            page,
            limit,
            search: query.search?.trim(),
            licenseStatus: query.licenseStatus,
            insuranceStatus: query.insuranceStatus,
            licenseSource: query.licenseSource,
            licenseState: query.licenseState?.trim().toUpperCase(),
            licenseType: query.licenseType?.trim(),
            expiresFrom: this.parseQueryDate(query.expiresFrom, "expiresFrom"),
            expiresTo: this.parseQueryDate(query.expiresTo, "expiresTo"),
            isActive: query.isActive,
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
        const record = await this.providerLicenseRepository.findById(id);
        if (!record) {
            throw new NotFoundException("Provider license record not found");
        }
        return record;
    }

    async update(id: string, payload: UpdateProviderLicenseDto) {
        await this.findOne(id);

        const data: Parameters<ProviderLicenseRepository["update"]>[1] = {};

        if (payload.doctorId !== undefined) data.doctorId = payload.doctorId;
        if (payload.doctorName !== undefined) data.doctorName = payload.doctorName.trim();
        if (payload.doctorEmail !== undefined)
            data.doctorEmail = payload.doctorEmail?.trim() ?? null;
        if (payload.avatarColor !== undefined)
            data.avatarColor = payload.avatarColor?.trim() ?? null;
        if (payload.npiNumber !== undefined)
            data.npiNumber = this.parseOptionalText(payload.npiNumber);
        if (payload.deaNumber !== undefined)
            data.deaNumber = this.parseOptionalText(payload.deaNumber);
        if (payload.licenseNumber !== undefined)
            data.licenseNumber = this.parseOptionalText(payload.licenseNumber);
        if (payload.licenseType !== undefined)
            data.licenseType = this.parseOptionalText(payload.licenseType);
        if (payload.licenseStates !== undefined)
            data.licenseStates = payload.licenseStates?.map((s) => s.trim().toUpperCase());
        if (payload.licenseSource !== undefined) data.licenseSource = payload.licenseSource;
        if (payload.licenseStatus !== undefined) data.licenseStatus = payload.licenseStatus;
        if (payload.licenseExpiresAt !== undefined)
            data.licenseExpiresAt = payload.licenseExpiresAt;
        if (payload.insuranceProvider !== undefined)
            data.insuranceProvider = this.parseOptionalText(payload.insuranceProvider);
        if (payload.insuranceStatus !== undefined) data.insuranceStatus = payload.insuranceStatus;
        if (payload.insuranceExpiresAt !== undefined)
            data.insuranceExpiresAt = payload.insuranceExpiresAt;
        if (payload.notes !== undefined) data.notes = this.parseOptionalText(payload.notes);
        if (payload.isActive !== undefined) data.isActive = payload.isActive;

        if (Object.keys(data).length === 0) {
            throw new BadRequestException("At least one field is required to update");
        }

        return this.providerLicenseRepository.update(id, data);
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.providerLicenseRepository.delete(id);
    }

    async exportCsv(
        query: Omit<ProviderLicenseQueryDto, "page" | "limit">,
        user?: AuthenticatedUser,
    ): Promise<string> {
        const { data } = await this.providerLicenseRepository.findAll({
            page: 1,
            limit: 10000,
            search: query.search?.trim(),
            licenseStatus: query.licenseStatus,
            insuranceStatus: query.insuranceStatus,
            licenseSource: query.licenseSource,
            licenseState: query.licenseState?.trim().toUpperCase(),
            licenseType: query.licenseType?.trim(),
            isActive: query.isActive,
        });

        // Trigger incident for Bulk Data Download
        const reportedBy = user ? `${user.email}` : "Billing Staff #7";
        const userRole = user?.role ?? "EMPLOYEE";
        await this.incidentService
            .triggerIncident({
                type: "Bulk Data Download",
                severity: "MEDIUM",
                reportedBy,
                affectedSystem: "Provider License Module",
                description: "Bulk patient record download detected",
                status: "RESOLVED",
                source: "SYSTEM_MONITORING",
                metadata: { userRole },
            })
            .catch((err) => {
                this.logger.error("Failed to trigger Bulk Data Download incident on export", err);
            });

        const headers = [
            "ID",
            "Doctor Name",
            "Doctor Email",
            "NPI Number",
            "DEA Number",
            "License Number",
            "License Type",
            "License States",
            "License Source",
            "License Status",
            "License Expires At",
            "Insurance Provider",
            "Insurance Status",
            "Insurance Expires At",
            "Is Active",
            "Created At",
        ];

        const rows = data.map((r) => [
            r.id,
            r.doctorName,
            r.doctorEmail ?? "",
            r.npiNumber ?? "",
            r.deaNumber ?? "",
            r.licenseNumber ?? "",
            r.licenseType ?? "",
            Array.isArray(r.licenseStates) ? (r.licenseStates as string[]).join(", ") : "",
            r.licenseSource,
            r.licenseStatus,
            r.licenseExpiresAt ?? "",
            r.insuranceProvider ?? "",
            r.insuranceStatus,
            r.insuranceExpiresAt ?? "",
            r.isActive,
            r.createdAt,
        ]);

        return this.exportService.generateCsv(headers, rows);
    }

    private parseOptionalText(value: string | null | undefined): string | null | undefined {
        if (value === null) return null;
        if (value === undefined) return undefined;
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
    }

    private parseQueryDate(value: string | undefined, fieldName: string): Date | undefined {
        if (!value) return undefined;
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            throw new BadRequestException(`${fieldName} must be a valid date`);
        }
        return date;
    }
}
