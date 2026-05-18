import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ProductCategoryResponseDto {
    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    id: string;

    @ApiProperty({ example: "Cardiology" })
    name: string;
}

export class ProductResponseDto {
    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    id: string;

    @ApiProperty({ example: "Blood Pressure Monitor" })
    name: string;

    @ApiProperty({ example: "https://example.com/products/bp-monitor.png" })
    image: string;

    @ApiProperty({ example: "49.99", description: "Decimal value serialized as a string" })
    price: string;

    @ApiProperty({ example: 25 })
    stockQuantity: number;

    @ApiPropertyOptional({ example: "Digital upper-arm blood pressure monitor", nullable: true })
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
