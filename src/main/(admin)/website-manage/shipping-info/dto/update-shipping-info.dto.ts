import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator";

export class PartnerPharmacyDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    logoId?: string;
}

export class PartnerPharmacySectionDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ type: [PartnerPharmacyDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PartnerPharmacyDto)
    partners?: PartnerPharmacyDto[];
}

export class ShippingTimelineStepDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;
}

export class ShippingTimelineSectionDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ type: [ShippingTimelineStepDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ShippingTimelineStepDto)
    steps?: ShippingTimelineStepDto[];
}

export class ShippingPolicyItemDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    text?: string;
}

export class ShippingPolicySectionDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    disclaimerTitle?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    disclaimerDescription?: string;

    @ApiPropertyOptional({ type: [ShippingPolicyItemDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ShippingPolicyItemDto)
    policies?: ShippingPolicyItemDto[];
}

export class UpdateShippingInfoDto {
    @ApiPropertyOptional({ type: PartnerPharmacySectionDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => PartnerPharmacySectionDto)
    partnerPharmacySection?: PartnerPharmacySectionDto;

    @ApiPropertyOptional({ type: ShippingTimelineSectionDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => ShippingTimelineSectionDto)
    shippingTimelineSection?: ShippingTimelineSectionDto;

    @ApiPropertyOptional({ type: ShippingPolicySectionDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => ShippingPolicySectionDto)
    shippingPolicySection?: ShippingPolicySectionDto;
}
