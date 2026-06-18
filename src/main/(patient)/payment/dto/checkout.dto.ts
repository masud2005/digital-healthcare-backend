import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";

export class ShippingInfoDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    fullName: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    contactNumber: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    address: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    city: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    state: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    zip: string;
}

export class PaymentInfoDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    method: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    cardHolderName: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    cardNumber: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    expiredDate: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    cvv: string;
}

export class ComplianceConfirmationDto {
    @ApiProperty()
    @IsBoolean()
    agreedToTermsAndPrivacy: boolean;

    @ApiProperty()
    @IsBoolean()
    certifiedInfoAccurate: boolean;

    @ApiProperty()
    @IsBoolean()
    understoodFalseInfoConsequences: boolean;

    @ApiProperty()
    @IsBoolean()
    understoodRecommendationsBasis: boolean;

    @ApiProperty()
    @IsBoolean()
    understoodAdditionalInfoMayBeRequested: boolean;
}

export class CheckoutDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    submissionId: string;

    @ApiProperty()
    @ValidateNested()
    @Type(() => ShippingInfoDto)
    @IsNotEmpty()
    shippingInfo: ShippingInfoDto;

    @ApiProperty()
    @ValidateNested()
    @Type(() => PaymentInfoDto)
    @IsNotEmpty()
    paymentInfo: PaymentInfoDto;

    @ApiProperty()
    @ValidateNested()
    @Type(() => ComplianceConfirmationDto)
    @IsNotEmpty()
    complianceConfirmation: ComplianceConfirmationDto;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    discountCode?: string;

    @ApiPropertyOptional()
    @IsBoolean()
    @IsOptional()
    isRecurring?: boolean;
}
