import type { SystemHealthStatus } from "@constant/enums";
import { systemHealthStatus } from "@constant/enums";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class SystemHealthQueryDto {
    @ApiPropertyOptional({ example: "api", description: "Search by name, category, or message" })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ example: "Infrastructure" })
    @IsOptional()
    @IsString()
    category?: string;

    @ApiPropertyOptional({ enum: systemHealthStatus, example: "OPERATIONAL" })
    @IsOptional()
    @IsEnum(systemHealthStatus)
    status?: SystemHealthStatus;

    @ApiPropertyOptional({ example: true, type: Boolean })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({ example: "2026-06-11T00:00:00.000Z" })
    @IsOptional()
    @IsString()
    checkedFrom?: string;

    @ApiPropertyOptional({ example: "2026-06-11T23:59:59.999Z" })
    @IsOptional()
    @IsString()
    checkedTo?: string;

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
