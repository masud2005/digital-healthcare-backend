import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
    IsArray,
    IsBoolean,
    IsInt,
    IsOptional,
    IsString,
    Min,
    ValidateNested,
} from "class-validator";

export class HowItWorksStepDto {
    @ApiPropertyOptional({ description: "Existing step ID (for updates)" })
    @IsOptional()
    @IsString()
    id?: string;

    @ApiPropertyOptional()
    @IsString()
    title: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    @Min(0)
    order?: number;
}

export class HomePageFaqDto {
    @ApiPropertyOptional({ description: "Existing FAQ ID (for updates)" })
    @IsOptional()
    @IsString()
    id?: string;

    @ApiPropertyOptional()
    @IsString()
    question: string;

    @ApiPropertyOptional()
    @IsString()
    answer: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    @Min(0)
    order?: number;
}

export class UpdateHomePageContentDto {
    // Hero Section
    @ApiPropertyOptional({ type: "string", format: "binary", description: "Hero section image" })
    @IsOptional()
    heroImage?: any;

    @ApiPropertyOptional({ type: "string", format: "binary", description: "Hero badge image" })
    @IsOptional()
    heroBadgeImage?: any;

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

    // Banner Section
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    bannerTitle?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    bannerDescription?: string;

    // About Section
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

    // Product Section
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

    // How It Works Section
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

    // Testimonials Section
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

    // Pricing Section
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
