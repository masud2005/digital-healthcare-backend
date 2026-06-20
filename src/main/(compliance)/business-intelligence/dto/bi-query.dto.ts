import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";

export enum TrendFilter {
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
