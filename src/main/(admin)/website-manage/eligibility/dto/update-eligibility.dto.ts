import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsOptional, IsString, ValidateNested } from "class-validator";

export class GeneralPointDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    point?: string;

    @ApiPropertyOptional({ default: true })
    @IsOptional()
    @IsBoolean()
    status?: boolean;
}

export class EligibilityFaqItemDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    question?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    answer?: string;
}

export class UpdateEligibilityDto {
    // General Eligibility Criteria
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    generalTitle?: string;

    @ApiPropertyOptional({ type: [GeneralPointDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => GeneralPointDto)
    generalPoints?: GeneralPointDto[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    generalBottomDesc?: string;

    // Qualification Section
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    qualificationTitle?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    qualificationbmi27Text?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    qualification27Description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    qualificationbmi30Text?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    qualification30Description?: string;

    // Who Can/Cannot Service
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    weightConditionSecTitle?: string;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    weightConditions?: string[];

    // Disease-Related Exclusions
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    contraindicationsSectionTitle?: string;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    contraindicationsSectionWrite?: string[];

    // Surgical/Medical Exclusions
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    requiredlabWorkSectionTitle?: string;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    requiredlabWorkSectionContraindications?: string[];

    // Drug-Related Exclusions
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    ongoingMonitoringSectionTitle?: string;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    ongoingMonitoringSectionContraindication?: string[];

    // Medical Evaluation
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    disclaimerSectionTitle?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    disclaimerSectionDes?: string;

    // FAQ Section
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    faqTitle?: string;

    @ApiPropertyOptional({ type: [EligibilityFaqItemDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EligibilityFaqItemDto)
    faqs?: EligibilityFaqItemDto[];
}
