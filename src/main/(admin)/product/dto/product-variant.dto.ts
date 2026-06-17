import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsDecimal, IsInt, IsNotEmpty, IsOptional, IsString, Matches, Min } from "class-validator";

export class ProductVariantDto {
    @ApiProperty({ example: "10 ml" })
    @IsString()
    @IsNotEmpty()
    size: string;

    @ApiProperty({ example: "24.99", description: "Decimal value" })
    @Transform(({ value }) => (value === null || value === undefined ? value : String(value)))
    @IsDecimal()
    @Matches(/^\d+(\.\d+)?$/)
    price: string;

    @ApiPropertyOptional({ example: 85 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    stockQuantity?: number;
}
