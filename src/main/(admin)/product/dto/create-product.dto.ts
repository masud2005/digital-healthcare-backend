import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
    IsArray,
    IsDecimal,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    Matches,
    Min,
    ValidateNested,
} from "class-validator";
import { ProductVariantDto } from "./product-variant.dto";

export class CreateProductDto {
    @ApiProperty({ example: "Blood Pressure Monitor" })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        type: [String],
        example: ["7f4145d8-087e-4d33-82bd-0f65d3fbdb4f"],
        description: "Array of pre-uploaded attachment IDs for product images",
    })
    @IsArray()
    @IsString({ each: true })
    @IsUUID("4", { each: true })
    images: string[];

    @ApiPropertyOptional({ example: "49.99", description: "Decimal value" })
    @IsOptional()
    @Transform(({ value }) => (value === null || value === undefined ? value : String(value)))
    @IsDecimal()
    @Matches(/^\d+(\.\d+)?$/)
    price?: string;

    @ApiPropertyOptional({ example: 25 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    stockQuantity?: number;

    @ApiPropertyOptional({ type: [ProductVariantDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductVariantDto)
    variants: ProductVariantDto[];

    @ApiPropertyOptional({ example: "Digital upper-arm blood pressure monitor" })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    @IsUUID()
    categoryId: string;
}
