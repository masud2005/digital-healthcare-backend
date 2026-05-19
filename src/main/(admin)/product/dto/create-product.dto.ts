import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
    IsDecimal,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    Matches,
    Min,
} from "class-validator";

export class CreateProductDto {
    @ApiProperty({ example: "Blood Pressure Monitor" })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        type: "array",
        items: {
            type: "string",
            format: "binary",
        },
        description: "Product images to upload",
    })
    @IsOptional()
    images: any;

    @ApiProperty({ example: "49.99", description: "Decimal value" })
    @Transform(({ value }) => (value === null || value === undefined ? value : String(value)))
    @IsDecimal()
    @Matches(/^\d+(\.\d+)?$/)
    price: string;

    @ApiPropertyOptional({ example: 25 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    stockQuantity?: number;

    @ApiPropertyOptional({ example: "Digital upper-arm blood pressure monitor" })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    @IsUUID()
    categoryId: string;
}
