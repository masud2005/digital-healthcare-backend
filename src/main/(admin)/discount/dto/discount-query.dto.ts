import type { DiscountType } from "@constant/enums";
import { discountType } from "@constant/enums";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
    IsBoolean,
    IsEnum,
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    Min,
} from "class-validator";

export class DiscountQueryDto {
    @ApiPropertyOptional({ example: "SUMMER", description: "Search by discount code" })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ enum: discountType, example: "PERCENTAGE" })
    @IsOptional()
    @IsEnum(discountType)
    type?: DiscountType;

    @ApiPropertyOptional({ example: true, type: Boolean })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({ example: 10, type: Number })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    minValue?: number;

    @ApiPropertyOptional({ example: 50, type: Number })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    maxValue?: number;

    @ApiPropertyOptional({ example: "2026-06-08T00:00:00.000Z" })
    @IsOptional()
    @IsString()
    expiresFrom?: string;

    @ApiPropertyOptional({ example: "2026-12-31T23:59:59.999Z" })
    @IsOptional()
    @IsString()
    expiresTo?: string;

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
