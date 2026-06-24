import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsArray, IsBoolean, IsOptional, IsString, ValidateNested } from "class-validator";
import { HomePageFaqDto, HowItWorksStepDto } from "./update-homepage.dto";

export class UpdateHeroSectionDto {
    @ApiPropertyOptional({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    @IsOptional()
    @IsString()
    heroImageId?: string;

    @ApiPropertyOptional({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    @IsOptional()
    @IsString()
    heroBadgeImageId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    heroBadgeText?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    heroBadgeLink?: string;

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
    heroButtonLink?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(({ value }) => value === "true" || value === true)
    @IsBoolean()
    heroButtonNewTab?: boolean;
}

export class UpdateBannerSectionDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    bannerTitle?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    bannerDescription?: string;
}

export class UpdateAboutSectionDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    aboutSubtitle?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    aboutTitle?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    aboutDescription?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    aboutPrimaryButtonText?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    aboutPrimaryButtonLink?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(({ value }) => value === "true" || value === true)
    @IsBoolean()
    aboutPrimaryButtonNewTab?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    aboutSecondaryButtonText?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    aboutSecondaryButtonLink?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(({ value }) => value === "true" || value === true)
    @IsBoolean()
    aboutSecondaryButtonNewTab?: boolean;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === "string") {
            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        }
        return value;
    })
    @IsArray()
    @IsString({ each: true })
    aboutBullets?: string[];
}

export class UpdateProductSectionDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    productTitle?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    productButtonLink?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(({ value }) => value === "true" || value === true)
    @IsBoolean()
    productButtonNewTab?: boolean;
}

export class UpdateHowItWorksSectionDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    howItWorksTitle?: string;

    @ApiPropertyOptional({ type: [HowItWorksStepDto] })
    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === "string") {
            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        }
        return value;
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => HowItWorksStepDto)
    howItWorksSteps?: HowItWorksStepDto[];
}

export class UpdateTestimonialsSectionDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    testimonialTitle?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    testimonialSubtitle?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    testimonialDescription?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    testimonialButtonLink?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(({ value }) => value === "true" || value === true)
    @IsBoolean()
    testimonialButtonNewTab?: boolean;
}

export class UpdatePricingSectionDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    pricingTitle?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    pricingSubtitle?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    pricingDescription?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    pricingButtonLink?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(({ value }) => value === "true" || value === true)
    @IsBoolean()
    pricingButtonNewTab?: boolean;

    @ApiPropertyOptional({ type: [HomePageFaqDto] })
    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === "string") {
            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        }
        return value;
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => HomePageFaqDto)
    faqs?: HomePageFaqDto[];
}
