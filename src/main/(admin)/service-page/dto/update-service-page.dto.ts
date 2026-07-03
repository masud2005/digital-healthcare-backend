import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsArray, IsOptional, IsString, ValidateNested, IsNumber } from "class-validator";
import { Type } from "class-transformer";

export class UpdateServicePageHeroSectionDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    bannerImageId?: string;

    @ApiProperty()
    @IsString()
    pageTitle: string;
}

export class UpdateServicePageSecondSectionDto {
    @ApiProperty()
    @IsString()
    sectionTitle: string;

    @ApiProperty()
    @IsString()
    sectionDescription: string;

    @ApiProperty()
    @IsString()
    ctaButtonText: string;

    @ApiProperty()
    @IsString()
    url: string;

    @ApiPropertyOptional({ default: false })
    @IsOptional()
    @IsBoolean()
    buttonTarget?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    featuredMediaId?: string;
}

export class UpdateServicePageFaqItemDto {
    @ApiProperty()
    @IsString()
    question: string;

    @ApiProperty()
    @IsString()
    answer: string;
}

export class UpdateServicePageFaqSectionDto {
    @ApiProperty()
    @IsString()
    sectionTitle: string;

    @ApiProperty({ type: [UpdateServicePageFaqItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateServicePageFaqItemDto)
    faqs: UpdateServicePageFaqItemDto[];
}

export class UpdateServicePageDto {
    @ApiPropertyOptional({ type: UpdateServicePageHeroSectionDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => UpdateServicePageHeroSectionDto)
    heroSection?: UpdateServicePageHeroSectionDto;

    @ApiPropertyOptional({ type: UpdateServicePageSecondSectionDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => UpdateServicePageSecondSectionDto)
    secondSection?: UpdateServicePageSecondSectionDto;

    @ApiPropertyOptional({ type: UpdateServicePageFaqSectionDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => UpdateServicePageFaqSectionDto)
    faqSection?: UpdateServicePageFaqSectionDto;
}
