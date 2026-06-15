import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsDecimal, IsInt, IsNotEmpty, IsOptional, IsString, Matches, Min } from "class-validator";

export class ProductVariantDto {
    @ApiPropertyOptional({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    @IsOptional()
    @IsString()
    id?: string;

    @ApiProperty({ example: "10 ml" })
    @IsString()
    @IsNotEmpty()
    size: string;

    @ApiProperty({ example: "24.99", description: "Decimal value" })
    @Transform(({ value }) => (value === null || value === undefined ? value : String(value)))
    @IsDecimal()
    @Matches(/^\d+(\.\d+)?$/)
    price: string;

    @ApiProperty({ example: 85 })
    @Type(() => Number)
    @IsInt()
    @Min(0)
    stockQuantity: number;
}
