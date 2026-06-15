import type { SideEffectSeverity, SideEffectStatus } from "@constant/enums";
import { sideEffectSeverity, sideEffectStatus } from "@constant/enums";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class SideEffectReportQueryDto {
    @ApiPropertyOptional({
        example: "Sarah",
        description: "Search by name, email, or description",
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ enum: sideEffectSeverity, example: "MILD" })
    @IsOptional()
    @IsEnum(sideEffectSeverity)
    severity?: SideEffectSeverity;

    @ApiPropertyOptional({ enum: sideEffectStatus, example: "PENDING" })
    @IsOptional()
    @IsEnum(sideEffectStatus)
    status?: SideEffectStatus;

    @ApiPropertyOptional({ example: "b2dfc059-d890-4c12-92e1-456cb3c829e2" })
    @IsOptional()
    @IsString()
    serviceId?: string;

    @ApiPropertyOptional({ example: "c7823ab2-0d19-4781-a9f3-df461cf02a31" })
    @IsOptional()
    @IsString()
    providerId?: string;

    @ApiPropertyOptional({ example: "2026-06-01T00:00:00.000Z" })
    @IsOptional()
    @IsString()
    from?: string;

    @ApiPropertyOptional({ example: "2026-06-30T23:59:59.999Z" })
    @IsOptional()
    @IsString()
    to?: string;

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
