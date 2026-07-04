import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator";

export class HowItWorksStepDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    timeline?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;
}

export class HowItWorksFaqItemDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    question?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    answer?: string;
}

export class UpdateHowItWorksDto {
    // How It Works Section
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    sectionTitle?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    sectionDescription?: string;

    @ApiPropertyOptional({ type: [HowItWorksStepDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => HowItWorksStepDto)
    steps?: HowItWorksStepDto[];

    // Disclaimer Section
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    disclaimerTitle?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    disclaimerDescription?: string;

    // FAQ Section
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    faqSectionTitle?: string;

    @ApiPropertyOptional({ type: [HowItWorksFaqItemDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => HowItWorksFaqItemDto)
    faqs?: HowItWorksFaqItemDto[];
}
