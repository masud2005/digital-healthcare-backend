import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AttachmentResponseDto } from "@global/attachment/dto/attachment-response.dto";

export class ProductCategoryResponseDto {
    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    id: string;

    @ApiProperty({ example: "Cardiology" })
    name: string;

    @ApiProperty({ example: "cardiology" })
    slug: string;
}

export class ProductVariantResponseDto {
    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    id: string;

    @ApiProperty({ example: "10 ml" })
    size: string;

    @ApiProperty({ example: "24.99", description: "Decimal value serialized as a string" })
    price: string;

    @ApiProperty({ example: 85 })
    stockQuantity: number;

    @ApiProperty({ example: "2026-05-18T04:00:00.000Z" })
    createdAt: Date;

    @ApiProperty({ example: "2026-05-18T04:00:00.000Z" })
    updatedAt: Date;
}

export class ProductResponseDto {
    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    id: string;

    @ApiProperty({ example: "Blood Pressure Monitor" })
    name: string;

    @ApiProperty({ example: "blood-pressure-monitor" })
    slug: string;

    @ApiProperty({ type: [AttachmentResponseDto] })
    images: AttachmentResponseDto[];

    @ApiPropertyOptional({
        example: "49.99",
        description: "Decimal value serialized as a string",
        nullable: true,
    })
    price: string | null;

    @ApiPropertyOptional({ example: 25, nullable: true })
    stockQuantity: number | null;

    @ApiProperty({ type: [ProductVariantResponseDto] })
    variants: ProductVariantResponseDto[];

    @ApiPropertyOptional({ example: "<p>Rich text HTML content for product description...</p>", nullable: true })
    description: string | null;

    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    categoryId: string;

    @ApiPropertyOptional({ type: ProductCategoryResponseDto })
    category?: ProductCategoryResponseDto;

    @ApiProperty({ example: "2026-05-18T04:00:00.000Z" })
    createdAt: Date;

    @ApiProperty({ example: "2026-05-18T04:00:00.000Z" })
    updatedAt: Date;
}

class ProductListMetaDto {
    @ApiProperty({ example: 1 })
    page: number;

    @ApiProperty({ example: 10 })
    limit: number;

    @ApiProperty({ example: 25 })
    total: number;

    @ApiProperty({ example: 3 })
    totalPages: number;
}

export class ProductListResponseDto {
    @ApiProperty({ type: [ProductResponseDto] })
    data: ProductResponseDto[];

    @ApiProperty({ type: ProductListMetaDto })
    meta: ProductListMetaDto;
}
