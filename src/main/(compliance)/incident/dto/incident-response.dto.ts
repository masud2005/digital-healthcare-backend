import { incidentSeverity, incidentSource, incidentStatus } from "@constant/enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class IncidentResponseDto {
    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    id: string;

    @ApiProperty({ example: "INC-001" })
    incidentId: string;

    @ApiProperty({ example: "Unauthorized Access Attempt" })
    type: string;

    @ApiProperty({ enum: incidentSeverity, example: "CRITICAL" })
    severity: string;

    @ApiProperty({ enum: incidentStatus, example: "OPEN" })
    status: string;

    @ApiProperty({ enum: incidentSource, example: "SECURITY_SCAN" })
    source: string;

    @ApiPropertyOptional({ example: "Authentication Service", nullable: true })
    affectedSystem: string | null;

    @ApiPropertyOptional({ example: "security@weightlossmd.com", nullable: true })
    reportedBy: string | null;

    @ApiPropertyOptional({ example: "Compliance Team", nullable: true })
    assignedTo: string | null;

    @ApiPropertyOptional({ example: "Failed access attempt detected.", nullable: true })
    description: string | null;

    @ApiPropertyOptional({ example: "Account locked and reviewed.", nullable: true })
    responseSummary: string | null;

    @ApiProperty({ example: "2026-06-11T08:30:00.000Z" })
    detectedAt: Date;

    @ApiPropertyOptional({ example: "2026-06-11T09:30:00.000Z", nullable: true })
    resolvedAt: Date | null;

    @ApiPropertyOptional({ example: { ipAddress: "203.0.113.42" }, nullable: true })
    metadata: Record<string, unknown> | null;

    @ApiProperty({ example: true })
    isActive: boolean;

    @ApiProperty({ example: "2026-06-11T08:30:00.000Z" })
    createdAt: Date;

    @ApiProperty({ example: "2026-06-11T08:30:00.000Z" })
    updatedAt: Date;
}

class IncidentListMetaDto {
    @ApiProperty({ example: 1 })
    page: number;

    @ApiProperty({ example: 10 })
    limit: number;

    @ApiProperty({ example: 125 })
    total: number;

    @ApiProperty({ example: 13 })
    totalPages: number;
}

class IncidentOverviewCountsDto {
    @ApiProperty({ example: 125 })
    total: number;

    @ApiProperty({ example: 12 })
    open: number;

    @ApiProperty({ example: 7 })
    investigating: number;

    @ApiProperty({ example: 101 })
    resolved: number;

    @ApiProperty({ example: 5 })
    closed: number;
}

class IncidentSeverityCountsDto {
    @ApiProperty({ example: 4 })
    critical: number;

    @ApiProperty({ example: 12 })
    high: number;

    @ApiProperty({ example: 31 })
    medium: number;

    @ApiProperty({ example: 78 })
    low: number;
}

export class IncidentListResponseDto {
    @ApiProperty({ type: [IncidentResponseDto] })
    data: IncidentResponseDto[];

    @ApiProperty({ type: IncidentListMetaDto })
    meta: IncidentListMetaDto;
}

export class IncidentOverviewResponseDto {
    @ApiProperty({ example: "Open Incidents" })
    title: string;

    @ApiProperty({ type: IncidentOverviewCountsDto })
    counts: IncidentOverviewCountsDto;

    @ApiProperty({ type: IncidentSeverityCountsDto })
    severityCounts: IncidentSeverityCountsDto;

    @ApiProperty({ type: [IncidentResponseDto] })
    latest: IncidentResponseDto[];
}
