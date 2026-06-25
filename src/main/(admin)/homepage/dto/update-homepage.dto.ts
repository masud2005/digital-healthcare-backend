import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsOptional, IsString } from "class-validator";

export class UpdateHomePageContentDto {
    // Hero Section
    @ApiPropertyOptional({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    @IsOptional()
    @IsString()
    heroMediaId?: string;

    @ApiPropertyOptional({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    @IsOptional()
    @IsString()
    heroBadgeImageId?: string;

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

    // Assessment Section
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    assessmentTitle?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    assessmentDescription?: string;

    // About Us Section
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
    aboutFeaturedService1Id?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    aboutFeaturedService2Id?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    aboutFeaturedService3Id?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    aboutButtonText?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    aboutButtonLink?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(({ value }) => value === "true" || value === true)
    @IsBoolean()
    aboutButtonNewTab?: boolean;

    @ApiPropertyOptional({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    @IsOptional()
    @IsString()
    aboutMediaId?: string;

    // Providers Section
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    providersTitle?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    providersButtonText?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    providersButtonLink?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(({ value }) => value === "true" || value === true)
    @IsBoolean()
    providersButtonNewTab?: boolean;

    // How It Works Section
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    howItWorksTitle?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    howItWorksStep1Title?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    howItWorksStep1Description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    howItWorksStep2Title?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    howItWorksStep2Description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    howItWorksStep3Title?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    howItWorksStep3Description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    howItWorksStep4Title?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    howItWorksStep4Description?: string;

    // Testimonial Section
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    testimonialTitle?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    testimonialCardTitle?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    testimonialCardDescription?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    testimonialButtonText?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    testimonialButtonLink?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(({ value }) => value === "true" || value === true)
    @IsBoolean()
    testimonialButtonNewTab?: boolean;

    // FAQ's Section
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    faqTitle?: string;

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
    faqButtonLink?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(({ value }) => value === "true" || value === true)
    @IsBoolean()
    faqButtonNewTab?: boolean;

    @ApiPropertyOptional({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    @IsOptional()
    @IsString()
    faqCardMediaId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    faqQuestion1?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    faqAnswer1?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    faqQuestion2?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    faqAnswer2?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    faqQuestion3?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    faqAnswer3?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    faqQuestion4?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    faqAnswer4?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    faqQuestion5?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    faqAnswer5?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    faqQuestion6?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    faqAnswer6?: string;
}
