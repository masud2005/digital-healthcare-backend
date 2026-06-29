import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsUUID, IsInt, Min } from "class-validator";

export class AddToCartDto {
    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    @IsUUID()
    productId: string;
}

export class UpdateCartItemDto {
    @ApiProperty({ example: "XL", required: false })
    @IsString()
    @IsOptional()
    size?: string;

    @ApiProperty({ example: 3, required: false, minimum: 1 })
    @IsInt()
    @Min(1)
    @IsOptional()
    quantity?: number;
}

export class CartItemParamDto {
    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    @IsUUID()
    id: string;
}

export class CartSummaryQueryDto {
    @ApiPropertyOptional({ example: "SAVE10", description: "Optional discount code" })
    @IsOptional()
    @IsString()
    discountCode?: string;

    @ApiPropertyOptional({ example: "uuid-here", description: "Optional submissionId to fetch its service fee" })
    @IsOptional()
    @IsString()
    submissionId?: string;
}
