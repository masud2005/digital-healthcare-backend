import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsOptional, IsString, ValidateNested } from "class-validator";

export class AboutUsFaqItemDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    question?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    answer?: string;
}

export class UpdateAboutUsDto {
    // Hero Section
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    heroTitle?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    heroDescription?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    heroButtonText?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    heroButtonUrl?: string;

    @ApiPropertyOptional({ default: true })
    @IsOptional()
    @IsBoolean()
    heroTargetBlank?: boolean;

    // Body Section 1
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    bodySection1Title?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    bodySection1Description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    bodySection1ButtonText?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    bodySection1ButtonUrl?: string;

    @ApiPropertyOptional({ default: true })
    @IsOptional()
    @IsBoolean()
    bodySection1TargetBlank?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    bodySection1ImageId?: string;

    // Body Section 2
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    bodySection2Tag?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    bodySection2Title?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    bodySection2Description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    bodySection2ButtonText?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    bodySection2ButtonUrl?: string;

    @ApiPropertyOptional({ default: true })
    @IsOptional()
    @IsBoolean()
    bodySection2TargetBlank?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    bodySection2ImageId?: string;

    // Body Section 3
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    bodySection3Tag?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    bodySection3Title?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    bodySection3Description?: string;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    bodySection3Points?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    bodySection3ButtonText?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    bodySection3ButtonUrl?: string;

    @ApiPropertyOptional({ default: true })
    @IsOptional()
    @IsBoolean()
    bodySection3TargetBlank?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    bodySection3ImageId?: string;

    // FAQ Section
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    faqSectionTitle?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    faqCardTitle?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    faqCardDescription?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    faqButtonText?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    faqButtonUrl?: string;

    @ApiPropertyOptional({ default: true })
    @IsOptional()
    @IsBoolean()
    faqTargetBlank?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    faqCardImageId?: string;

    @ApiPropertyOptional({ type: [AboutUsFaqItemDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AboutUsFaqItemDto)
    faqs?: AboutUsFaqItemDto[];
}
