import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";

export enum TrendFilter {
    TODAY = "today",
    LAST_7_DAYS = "last_7_days",
    LAST_MONTH = "last_month",
    LAST_YEAR = "last_year",
}

export class TrendQueryDto {
    @ApiPropertyOptional({ enum: TrendFilter, default: TrendFilter.LAST_7_DAYS })
    @IsOptional()
    @IsEnum(TrendFilter)
    filter?: TrendFilter;
}

export class DropOffQueryDto {
    @ApiPropertyOptional({ default: 1 })
    @IsOptional()
    page?: number;

    @ApiPropertyOptional({ default: 10 })
    @IsOptional()
    limit?: number;

    @ApiPropertyOptional({ description: "Search by name or email" })
    @IsOptional()
    search?: string;

    @ApiPropertyOptional()
    @IsOptional()
    categoryId?: string;

    @ApiPropertyOptional({ description: "New Patient or Repeat Patient" })
    @IsOptional()
    patientType?: string;

    @ApiPropertyOptional({ enum: TrendFilter })
    @IsOptional()
    @IsEnum(TrendFilter)
    date?: TrendFilter;
}
