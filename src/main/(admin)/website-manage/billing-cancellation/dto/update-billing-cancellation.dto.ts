import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator";

export class BillingTimelineStepDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    step?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;
}

export class BillingCancellationFaqItemDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    question?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    answer?: string;
}

export class UpdateBillingCancellationDto {
    // Billing Timeline Section
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    timelineTitle?: string;

    @ApiPropertyOptional({ type: [BillingTimelineStepDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BillingTimelineStepDto)
    timelineSteps?: BillingTimelineStepDto[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    timelineDisclaimerTitle?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    timelineDisclaimerDescription?: string;

    // Billing Cancellation Section
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    cancelTitle?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    cancelDescription?: string;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    cancelSteps?: string[];

    // Eligible for Refund Section
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    refundEligibleTitle?: string;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    refundEligibleConditions?: string[];

    // Not Eligible for Refund Section
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    refundNotEligibleTitle?: string;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    refundNotEligibleConditions?: string[];

    // FAQ Section
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    faqTitle?: string;

    @ApiPropertyOptional({ type: [BillingCancellationFaqItemDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BillingCancellationFaqItemDto)
    faqs?: BillingCancellationFaqItemDto[];
}
