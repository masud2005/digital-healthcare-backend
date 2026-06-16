import type { IncidentSeverity, IncidentSource, IncidentStatus } from "@constant/enums";
import { incidentSeverity, incidentSource, incidentStatus } from "@constant/enums";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class IncidentQueryDto {
    @ApiPropertyOptional({
        example: "INC-001",
        description: "Search by ID, type, person, or notes",
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ enum: incidentSeverity, example: "CRITICAL" })
    @IsOptional()
    @IsEnum(incidentSeverity)
    severity?: IncidentSeverity;

    @ApiPropertyOptional({ enum: incidentStatus, example: "OPEN" })
    @IsOptional()
    @IsEnum(incidentStatus)
    status?: IncidentStatus;

    @ApiPropertyOptional({ enum: incidentSource, example: "SECURITY_SCAN" })
    @IsOptional()
    @IsEnum(incidentSource)
    source?: IncidentSource;

    @ApiPropertyOptional({ example: true, type: Boolean })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({ example: "2026-06-01T00:00:00.000Z" })
    @IsOptional()
    @IsString()
    detectedFrom?: string;

    @ApiPropertyOptional({ example: "2026-06-30T23:59:59.999Z" })
    @IsOptional()
    @IsString()
    detectedTo?: string;

    @ApiPropertyOptional({ example: "DOCTOR", description: "Filter by role of user involved" })
    @IsOptional()
    @IsString()
    role?: string;

    @ApiPropertyOptional({ example: "Suspicious Login", description: "Filter by incident type" })
    @IsOptional()
    @IsString()
    type?: string;

    @ApiPropertyOptional({ example: 1, type: Number })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @ApiPropertyOptional({ example: 10, type: Number })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number;
}
