import { ApiPropertyOptional } from "@nestjs/swagger";
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

export class UpdateProductDto {
    @ApiPropertyOptional({ example: "Blood Pressure Monitor" })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @ApiPropertyOptional({ example: "blood-pressure-monitor" })
    @IsOptional()
    @IsString()
    slug?: string;

    @ApiPropertyOptional({
        type: [String],
        example: ["7f4145d8-087e-4d33-82bd-0f65d3fbdb4f"],
        description: "Array of pre-uploaded attachment IDs for product images",
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @IsUUID("4", { each: true })
    images?: string[];

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
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductVariantDto)
    variants?: ProductVariantDto[];

    @ApiPropertyOptional({ example: "Digital upper-arm blood pressure monitor", nullable: true })
    @IsOptional()
    @IsString()
    description?: string | null;

    @ApiPropertyOptional({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    @IsOptional()
    @IsUUID()
    categoryId?: string;
}
