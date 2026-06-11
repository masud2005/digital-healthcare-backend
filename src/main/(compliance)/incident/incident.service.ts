import type { IncidentStatus } from "@constant/enums";
import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { CreateIncidentDto } from "./dto/create-incident.dto";
import { IncidentQueryDto } from "./dto/incident-query.dto";
import { UpdateIncidentDto } from "./dto/update-incident.dto";
import { IncidentRepository } from "./incident.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

@Injectable()
export class IncidentService {
    constructor(private readonly incidentRepository: IncidentRepository) {}

    async create(payload: CreateIncidentDto) {
        const data = this.normalizeCreatePayload(payload);
        await this.ensureIncidentIdIsAvailable(data.incidentId);

        try {
            return await this.incidentRepository.create(data);
        } catch (error) {
            this.throwKnownPrismaError(error);
            throw error;
        }
    }

    async getOverview() {
        const overview = await this.incidentRepository.getOverview();
        const severityCounts = {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
        };

        for (const row of overview.severityCounts) {
            const count = typeof row._count === "object" ? (row._count._all ?? 0) : 0;

            if (row.severity === "CRITICAL") {
                severityCounts.critical = count;
            }

            if (row.severity === "HIGH") {
                severityCounts.high = count;
            }

            if (row.severity === "MEDIUM") {
                severityCounts.medium = count;
            }

            if (row.severity === "LOW") {
                severityCounts.low = count;
            }
        }

        return {
            title:
                overview.counts.open > 0
                    ? "Open Incidents"
                    : overview.counts.investigating > 0
                      ? "Incidents Under Investigation"
                      : "No Open Incidents",
            counts: overview.counts,
            severityCounts,
            latest: overview.latest,
        };
    }

    async findAll(query: IncidentQueryDto) {
        const page = query.page ?? DEFAULT_PAGE;
        const limit = query.limit ?? DEFAULT_LIMIT;

        const { data, total } = await this.incidentRepository.findAll({
            page,
            limit,
            search: query.search?.trim(),
            severity: query.severity,
            status: query.status,
            source: query.source,
            isActive: query.isActive,
            detectedFrom: this.parseQueryDate(query.detectedFrom, "detectedFrom"),
            detectedTo: this.parseQueryDate(query.detectedTo, "detectedTo"),
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
        const incident = await this.incidentRepository.findById(id);

        if (!incident) {
            throw new NotFoundException("Incident not found");
        }

        return incident;
    }

    async update(id: string, payload: UpdateIncidentDto) {
        const existing = await this.findOne(id);
        const data = this.normalizeUpdatePayload(payload);

        if (data.incidentId) {
            await this.ensureIncidentIdIsAvailable(data.incidentId, id);
        }

        if (data.status && this.isResolvedStatus(data.status) && data.resolvedAt === undefined) {
            data.resolvedAt = existing.resolvedAt ?? new Date();
        }

        if (data.status && !this.isResolvedStatus(data.status) && payload.resolvedAt === undefined) {
            data.resolvedAt = null;
        }

        try {
            return await this.incidentRepository.update(id, data);
        } catch (error) {
            this.throwKnownPrismaError(error);
            throw error;
        }
    }

    async remove(id: string) {
        await this.findOne(id);

        try {
            return await this.incidentRepository.delete(id);
        } catch (error) {
            this.throwKnownPrismaError(error);
            throw error;
        }
    }

    private normalizeCreatePayload(payload: CreateIncidentDto) {
        return {
            incidentId: payload.incidentId.trim().toUpperCase(),
            type: payload.type.trim(),
            severity: payload.severity,
            status: payload.status,
            source: payload.source,
            affectedSystem: this.parseOptionalText(payload.affectedSystem),
            reportedBy: this.parseOptionalText(payload.reportedBy),
            assignedTo: this.parseOptionalText(payload.assignedTo),
            description: this.parseOptionalText(payload.description),
            responseSummary: this.parseOptionalText(payload.responseSummary),
            detectedAt: payload.detectedAt,
            resolvedAt: payload.resolvedAt ?? undefined,
            metadata: this.parseMetadata(payload.metadata),
            isActive: payload.isActive,
        };
    }

    private normalizeUpdatePayload(payload: UpdateIncidentDto) {
        const data: {
            incidentId?: string;
            type?: string;
            severity?: CreateIncidentDto["severity"];
            status?: IncidentStatus;
            source?: CreateIncidentDto["source"];
            affectedSystem?: string | null;
            reportedBy?: string | null;
            assignedTo?: string | null;
            description?: string | null;
            responseSummary?: string | null;
            detectedAt?: Date;
            resolvedAt?: Date | null;
            metadata?: Prisma.InputJsonValue;
            isActive?: boolean;
        } = {};

        if (payload.incidentId !== undefined) {
            data.incidentId = payload.incidentId.trim().toUpperCase();
        }

        if (payload.type !== undefined) {
            data.type = payload.type.trim();
        }

        if (payload.severity !== undefined) {
            data.severity = payload.severity;
        }

        if (payload.status !== undefined) {
            data.status = payload.status;
        }

        if (payload.source !== undefined) {
            data.source = payload.source;
        }

        if (payload.affectedSystem !== undefined) {
            data.affectedSystem = this.parseOptionalText(payload.affectedSystem);
        }

        if (payload.reportedBy !== undefined) {
            data.reportedBy = this.parseOptionalText(payload.reportedBy);
        }

        if (payload.assignedTo !== undefined) {
            data.assignedTo = this.parseOptionalText(payload.assignedTo);
        }

        if (payload.description !== undefined) {
            data.description = this.parseOptionalText(payload.description);
        }

        if (payload.responseSummary !== undefined) {
            data.responseSummary = this.parseOptionalText(payload.responseSummary);
        }

        if (payload.detectedAt !== undefined) {
            data.detectedAt = payload.detectedAt;
        }

        if (payload.resolvedAt !== undefined) {
            data.resolvedAt = payload.resolvedAt;
        }

        if (payload.metadata !== undefined) {
            data.metadata = this.parseMetadata(payload.metadata);
        }

        if (payload.isActive !== undefined) {
            data.isActive = payload.isActive;
        }

        if (Object.keys(data).length === 0) {
            throw new BadRequestException("At least one incident field is required");
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

    private parseMetadata(value: unknown): Prisma.InputJsonValue | undefined {
        if (value === undefined) {
            return undefined;
        }

        if (typeof value === "string") {
            const trimmed = value.trim();

            if (!trimmed) {
                return undefined;
            }

            try {
                return JSON.parse(trimmed) as Prisma.InputJsonValue;
            } catch {
                throw new BadRequestException("metadata must be valid JSON");
            }
        }

        return value as Prisma.InputJsonValue;
    }

    private parseQueryDate(value: string | undefined, fieldName: string) {
        if (!value) {
            return undefined;
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            throw new BadRequestException(`${fieldName} must be a valid date`);
        }

        return date;
    }

    private async ensureIncidentIdIsAvailable(incidentId: string, excludeId?: string) {
        const existingIncident = await this.incidentRepository.findByIncidentId(incidentId);

        if (existingIncident && existingIncident.id !== excludeId) {
            throw new ConflictException("Incident ID already exists");
        }
    }

    private isResolvedStatus(status: IncidentStatus) {
        return status === "RESOLVED" || status === "CLOSED";
    }

    private throwKnownPrismaError(error: unknown) {
        const prismaError = error as { code?: string };

        if (prismaError.code === "P2002") {
            throw new ConflictException("Incident ID already exists");
        }
    }
}
