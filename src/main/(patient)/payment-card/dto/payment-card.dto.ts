import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreatePaymentCardDto {
    @ApiPropertyOptional({ description: "Clover generated source token" })
    @IsString()
    @IsOptional()
    cloverToken?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    last4?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    brand?: string;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    expMonth?: number;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    expYear?: number;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    cardHolderName?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    cardNumber?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    expiredDate?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    cvv?: string;

    @ApiPropertyOptional()
    @IsBoolean()
    @IsOptional()
    isDefault?: boolean;
}

export class UpdatePaymentCardDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    cardHolderName?: string;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    expMonth?: number;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    expYear?: number;
}
