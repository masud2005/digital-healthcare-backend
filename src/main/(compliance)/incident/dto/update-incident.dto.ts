import type { IncidentSeverity, IncidentSource, IncidentStatus } from "@constant/enums";
import { incidentSeverity, incidentSource, incidentStatus } from "@constant/enums";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
    IsBoolean,
    IsDate,
    IsEnum,
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
} from "class-validator";

export class UpdateIncidentDto {
    @ApiPropertyOptional({ example: "INC-001" })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    incidentId?: string;

    @ApiPropertyOptional({ example: "Suspicious Login" })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    type?: string;

    @ApiPropertyOptional({ enum: incidentSeverity, example: "HIGH" })
    @IsOptional()
    @IsEnum(incidentSeverity)
    severity?: IncidentSeverity;

    @ApiPropertyOptional({ enum: incidentStatus, example: "INVESTIGATING" })
    @IsOptional()
    @IsEnum(incidentStatus)
    status?: IncidentStatus;

    @ApiPropertyOptional({ enum: incidentSource, example: "SYSTEM_MONITORING" })
    @IsOptional()
    @IsEnum(incidentSource)
    source?: IncidentSource;

    @ApiPropertyOptional({ example: "Patient Portal", nullable: true })
    @IsOptional()
    @IsString()
    affectedSystem?: string | null;

    @ApiPropertyOptional({ example: "support@weightlossmd.com", nullable: true })
    @IsOptional()
    @IsString()
    reportedBy?: string | null;

    @ApiPropertyOptional({ example: "Security Team", nullable: true })
    @IsOptional()
    @IsString()
    assignedTo?: string | null;

    @ApiPropertyOptional({ example: "Suspicious activity was reviewed.", nullable: true })
    @IsOptional()
    @IsString()
    description?: string | null;

    @ApiPropertyOptional({ example: "Closed after review.", nullable: true })
    @IsOptional()
    @IsString()
    responseSummary?: string | null;

    @ApiPropertyOptional({ example: "2026-06-11T08:30:00.000Z" })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    detectedAt?: Date;

    @ApiPropertyOptional({ example: "2026-06-11T09:30:00.000Z", nullable: true })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    resolvedAt?: Date | null;

    @ApiPropertyOptional({ example: { ipAddress: "203.0.113.42" }, nullable: true })
    @IsOptional()
    @IsObject()
    metadata?: Record<string, unknown>;

    @ApiPropertyOptional({ example: true, type: Boolean })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    isActive?: boolean;
}
