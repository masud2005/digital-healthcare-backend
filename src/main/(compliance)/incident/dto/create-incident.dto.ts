import type { IncidentSeverity, IncidentSource, IncidentStatus } from "@constant/enums";
import { incidentSeverity, incidentSource, incidentStatus } from "@constant/enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
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

export class CreateIncidentDto {
    @ApiProperty({ example: "INC-001" })
    @IsString()
    @IsNotEmpty()
    incidentId: string;

    @ApiProperty({ example: "Unauthorized Access Attempt" })
    @IsString()
    @IsNotEmpty()
    type: string;

    @ApiProperty({ enum: incidentSeverity, example: "CRITICAL" })
    @IsEnum(incidentSeverity)
    severity: IncidentSeverity;

    @ApiPropertyOptional({ enum: incidentStatus, example: "OPEN" })
    @IsOptional()
    @IsEnum(incidentStatus)
    status?: IncidentStatus;

    @ApiPropertyOptional({ enum: incidentSource, example: "SECURITY_SCAN" })
    @IsOptional()
    @IsEnum(incidentSource)
    source?: IncidentSource;

    @ApiPropertyOptional({ example: "Authentication Service", nullable: true })
    @IsOptional()
    @IsString()
    affectedSystem?: string | null;

    @ApiPropertyOptional({ example: "security@weightlossmd.com", nullable: true })
    @IsOptional()
    @IsString()
    reportedBy?: string | null;

    @ApiPropertyOptional({ example: "Compliance Team", nullable: true })
    @IsOptional()
    @IsString()
    assignedTo?: string | null;

    @ApiPropertyOptional({
        example: "Multiple failed login attempts were detected for a patient account.",
        nullable: true,
    })
    @IsOptional()
    @IsString()
    description?: string | null;

    @ApiPropertyOptional({
        example: "Account access was blocked and the patient was notified.",
        nullable: true,
    })
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

    @ApiPropertyOptional({
        example: { ipAddress: "203.0.113.42", attempts: 5 },
        nullable: true,
    })
    @IsOptional()
    @IsObject()
    metadata?: Record<string, unknown>;

    @ApiPropertyOptional({ example: true, type: Boolean })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    isActive?: boolean;
}
