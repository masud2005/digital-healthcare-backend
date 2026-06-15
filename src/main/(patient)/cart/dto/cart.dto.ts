import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class AddToCartDto {
    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    @IsUUID()
    @IsNotEmpty()
    productId: string;

    @ApiProperty({ example: 1 })
    @IsInt()
    @Min(1)
    quantity: number;

    @ApiPropertyOptional({ example: "L" })
    @IsString()
    @IsOptional()
    size?: string;
}

export class UpdateCartItemDto {
    @ApiPropertyOptional({ example: 3, minimum: 1 })
    @IsInt()
    @Min(1)
    @IsOptional()
    quantity?: number;

    @ApiPropertyOptional({ example: "XL" })
    @IsString()
    @IsOptional()
    size?: string;
}

export class CartItemParamDto {
    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    @IsUUID()
    id: string;
}
