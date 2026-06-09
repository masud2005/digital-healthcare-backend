import type { DiscountType } from "@constant/enums";
import { discountType } from "@constant/enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class DiscountResponseDto {
    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    id: string;

    @ApiProperty({ example: "SUMMER25" })
    code: string;

    @ApiProperty({ enum: discountType, example: "PERCENTAGE" })
    type: DiscountType;

    @ApiProperty({ example: 25 })
    value: number;

    @ApiPropertyOptional({ example: "2026-12-31T23:59:59.999Z", nullable: true })
    expiresAt: Date | null;

    @ApiProperty({ example: true })
    isActive: boolean;

    @ApiProperty({ example: "2026-06-08T00:00:00.000Z" })
    createdAt: Date;

    @ApiProperty({ example: "2026-06-08T00:00:00.000Z" })
    updatedAt: Date;
}

class DiscountListMetaDto {
    @ApiProperty({ example: 1 })
    page: number;

    @ApiProperty({ example: 10 })
    limit: number;

    @ApiProperty({ example: 25 })
    total: number;

    @ApiProperty({ example: 3 })
    totalPages: number;
}

export class DiscountListResponseDto {
    @ApiProperty({ type: [DiscountResponseDto] })
    data: DiscountResponseDto[];

    @ApiProperty({ type: DiscountListMetaDto })
    meta: DiscountListMetaDto;
}
