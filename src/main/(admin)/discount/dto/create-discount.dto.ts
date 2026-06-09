import type { DiscountType } from "@constant/enums";
import { discountType } from "@constant/enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
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

export class CreateDiscountDto {
    @ApiProperty({ example: "SUMMER25" })
    @IsString()
    @IsNotEmpty()
    code: string;

    @ApiProperty({ enum: discountType, example: "PERCENTAGE" })
    @IsEnum(discountType)
    type: DiscountType;

    @ApiProperty({ example: 25, type: Number })
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    value: number;

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
