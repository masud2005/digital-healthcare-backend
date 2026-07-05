import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreatePaymentCardDto {
    @ApiProperty({ description: "Clover generated source token" })
    @IsString()
    @IsNotEmpty()
    cloverToken: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    last4: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    brand: string;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    expMonth: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    expYear: number;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    cardHolderName?: string;

    @ApiPropertyOptional({ default: false })
    @IsBoolean()
    @IsOptional()
    isDefault?: boolean;
}
