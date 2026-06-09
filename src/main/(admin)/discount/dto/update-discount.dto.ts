import type { DiscountType } from "@constant/enums";
import { discountType } from "@constant/enums";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
    IsBoolean,
    IsDate,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from "class-validator";

export class UpdateDiscountDto {
    @ApiPropertyOptional({ example: "SUMMER25" })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    code?: string;

    @ApiPropertyOptional({ enum: discountType, example: "FIXED_AMOUNT" })
    @IsOptional()
    @IsEnum(discountType)
    type?: DiscountType;

    @ApiPropertyOptional({ example: 25, type: Number })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    value?: number;

    @ApiPropertyOptional({ example: "2026-12-31T23:59:59.999Z", nullable: true })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    expiresAt?: Date | null;

    @ApiPropertyOptional({ example: true, type: Boolean })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    isActive?: boolean;
}
