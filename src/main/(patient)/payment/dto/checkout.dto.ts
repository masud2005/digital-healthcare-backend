import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    ValidateNested,
} from "class-validator";
import { BillingCycle } from "@prisma/client";

export class ShippingInfoDto {
    @ApiProperty({ example: "John Doe" })
    @IsString()
    @IsNotEmpty()
    fullName: string;

    @ApiProperty({ example: "+1-555-000-0000" })
    @IsString()
    @IsNotEmpty()
    contactNumber: string;

    @ApiProperty({ example: "123 Main St" })
    @IsString()
    @IsNotEmpty()
    address: string;

    @ApiProperty({ example: "New York" })
    @IsString()
    @IsNotEmpty()
    city: string;

    @ApiProperty({ example: "NY" })
    @IsString()
    @IsNotEmpty()
    state: string;

    @ApiProperty({ example: "10001" })
    @IsString()
    @IsNotEmpty()
    zip: string;
}

export class PaymentInfoDto {
    @ApiProperty({
        example: "CLOVER",
        description: "Payment method used. e.g. CLOVER, STRIPE, CARD",
    })
    @IsString()
    @IsNotEmpty()
    method: string;

    @ApiPropertyOptional({
        description: "ID of a previously saved payment card. If provided, other card details are not required.",
    })
    @IsString()
    @IsOptional()
    savedCardId?: string;

    @ApiPropertyOptional({
        description: "Clover secure token for frontend tokenization. Recommended over sending raw card data.",
    })
    @IsString()
    @IsOptional()
    cloverToken?: string;

    @ApiPropertyOptional({ example: "John Doe" })
    @IsString()
    @IsOptional()
    cardHolderName?: string;

    @ApiPropertyOptional({
        example: "4111111111111111",
        description: "Full card number. (Not recommended, use cloverToken or savedCardId instead)",
    })
    @IsString()
    @IsOptional()
    cardNumber?: string;

    @ApiPropertyOptional({ example: "12/27" })
    @IsString()
    @IsOptional()
    expiredDate?: string;

    @ApiPropertyOptional({ example: "123" })
    @IsString()
    @IsOptional()
    cvv?: string;
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
    @ApiPropertyOptional({
        description:
            "Required ONLY for subscription-based checkout or subscription+product checkout. " +
            "Not required when purchasing products only.",
        example: "uuid-here",
    })
    @IsString()
    @IsOptional()
    submissionId?: string;

    @ApiProperty({ description: "Shipping address for product delivery" })
    @ValidateNested()
    @Type(() => ShippingInfoDto)
    @IsNotEmpty()
    shippingInfo: ShippingInfoDto;

    @ApiProperty({ description: "Card/payment details" })
    @ValidateNested()
    @Type(() => PaymentInfoDto)
    @IsNotEmpty()
    paymentInfo: PaymentInfoDto;

    @ApiPropertyOptional({
        description:
            "Required ONLY when submissionId is provided. " +
            "Patient's compliance agreement confirmations.",
    })
    @ValidateNested()
    @Type(() => ComplianceConfirmationDto)
    @IsOptional()
    complianceConfirmation?: ComplianceConfirmationDto;

    @ApiPropertyOptional({
        description: "Optional discount code to apply to the total",
        example: "SAVE10",
    })
    @IsString()
    @IsOptional()
    discountCode?: string;

    @ApiPropertyOptional({
        description:
            "Set to true to create a recurring subscription for the selected category. " +
            "Requires the user's category to have an active PaymentPlan. " +
            "If false or omitted, only a one-time order is created.",
        example: true,
    })
    @IsBoolean()
    @IsOptional()
    isRecurring?: boolean;

    @ApiPropertyOptional({
        enum: BillingCycle,
        description:
            "Billing cycle for the subscription. Required when isRecurring=true. " +
            "Overrides the category's default billing cycle.",
        example: "MONTHLY",
    })
    @IsEnum(BillingCycle)
    @IsOptional()
    billingCycle?: BillingCycle;
}
