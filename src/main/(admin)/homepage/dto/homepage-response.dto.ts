import { AttachmentResponseDto } from "@global/attachment/dto/attachment-response.dto";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class HomePageCategoryResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    slug: string;
}

export class HomePageContentResponseDto {
    @ApiProperty()
    id: string;

    // Hero Section
    @ApiPropertyOptional({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f", nullable: true })
    heroMediaId: string | null;

    @ApiPropertyOptional({ type: AttachmentResponseDto, nullable: true })
    heroMedia: AttachmentResponseDto | null;

    @ApiPropertyOptional({ nullable: true })
    heroMediaUrl: string | null;

    @ApiPropertyOptional({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f", nullable: true })
    heroBadgeImageId: string | null;

    @ApiPropertyOptional({ type: AttachmentResponseDto, nullable: true })
    heroBadgeImage: AttachmentResponseDto | null;

    @ApiPropertyOptional({ nullable: true })
    heroBadgeImageUrl: string | null;

    @ApiPropertyOptional({ nullable: true })
    heroTitle: string | null;

    @ApiPropertyOptional({ nullable: true })
    heroDescription: string | null;

    @ApiPropertyOptional({ nullable: true })
    heroButtonText: string | null;

    @ApiPropertyOptional({ nullable: true })
    heroButtonLink: string | null;

    @ApiProperty()
    heroButtonNewTab: boolean;

    // Assessment Section
    @ApiPropertyOptional({ nullable: true })
    assessmentTitle: string | null;

    @ApiPropertyOptional({ nullable: true })
    assessmentDescription: string | null;

    // About Us Section
    @ApiPropertyOptional({ nullable: true })
    aboutTitle: string | null;

    @ApiPropertyOptional({ nullable: true })
    aboutDescription: string | null;

    @ApiPropertyOptional({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f", nullable: true })
    aboutFeaturedService1Id: string | null;

    @ApiPropertyOptional({ type: HomePageCategoryResponseDto, nullable: true })
    aboutFeaturedService1: HomePageCategoryResponseDto | null;

    @ApiPropertyOptional({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f", nullable: true })
    aboutFeaturedService2Id: string | null;

    @ApiPropertyOptional({ type: HomePageCategoryResponseDto, nullable: true })
    aboutFeaturedService2: HomePageCategoryResponseDto | null;

    @ApiPropertyOptional({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f", nullable: true })
    aboutFeaturedService3Id: string | null;

    @ApiPropertyOptional({ type: HomePageCategoryResponseDto, nullable: true })
    aboutFeaturedService3: HomePageCategoryResponseDto | null;

    @ApiPropertyOptional({ nullable: true })
    aboutButtonText: string | null;

    @ApiPropertyOptional({ nullable: true })
    aboutButtonLink: string | null;

    @ApiProperty()
    aboutButtonNewTab: boolean;

    @ApiPropertyOptional({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f", nullable: true })
    aboutMediaId: string | null;

    @ApiPropertyOptional({ type: AttachmentResponseDto, nullable: true })
    aboutMedia: AttachmentResponseDto | null;

    @ApiPropertyOptional({ nullable: true })
    aboutMediaUrl: string | null;

    // Providers Section
    @ApiPropertyOptional({ nullable: true })
    providersTitle: string | null;

    @ApiPropertyOptional({ nullable: true })
    providersButtonText: string | null;

    @ApiPropertyOptional({ nullable: true })
    providersButtonLink: string | null;

    @ApiProperty()
    providersButtonNewTab: boolean;

    // How It Works Section
    @ApiPropertyOptional({ nullable: true })
    howItWorksTitle: string | null;

    @ApiPropertyOptional({ nullable: true })
    howItWorksStep1Title: string | null;

    @ApiPropertyOptional({ nullable: true })
    howItWorksStep1Description: string | null;

    @ApiPropertyOptional({ nullable: true })
    howItWorksStep2Title: string | null;

    @ApiPropertyOptional({ nullable: true })
    howItWorksStep2Description: string | null;

    @ApiPropertyOptional({ nullable: true })
    howItWorksStep3Title: string | null;

    @ApiPropertyOptional({ nullable: true })
    howItWorksStep3Description: string | null;

    @ApiPropertyOptional({ nullable: true })
    howItWorksStep4Title: string | null;

    @ApiPropertyOptional({ nullable: true })
    howItWorksStep4Description: string | null;

    // Testimonial Section
    @ApiPropertyOptional({ nullable: true })
    testimonialTitle: string | null;

    @ApiPropertyOptional({ nullable: true })
    testimonialCardTitle: string | null;

    @ApiPropertyOptional({ nullable: true })
    testimonialCardDescription: string | null;

    @ApiPropertyOptional({ nullable: true })
    testimonialButtonText: string | null;

    @ApiPropertyOptional({ nullable: true })
    testimonialButtonLink: string | null;

    @ApiProperty()
    testimonialButtonNewTab: boolean;

    // FAQ's Section
    @ApiPropertyOptional({ nullable: true })
    faqTitle: string | null;

    @ApiPropertyOptional({ nullable: true })
    faqCardTitle: string | null;

    @ApiPropertyOptional({ nullable: true })
    faqCardDescription: string | null;

    @ApiPropertyOptional({ nullable: true })
    faqButtonText: string | null;

    @ApiPropertyOptional({ nullable: true })
    faqButtonLink: string | null;

    @ApiProperty()
    faqButtonNewTab: boolean;

    @ApiPropertyOptional({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f", nullable: true })
    faqCardMediaId: string | null;

    @ApiPropertyOptional({ type: AttachmentResponseDto, nullable: true })
    faqCardMedia: AttachmentResponseDto | null;

    @ApiPropertyOptional({ nullable: true })
    faqCardMediaUrl: string | null;

    @ApiPropertyOptional({ nullable: true })
    faqQuestion1: string | null;

    @ApiPropertyOptional({ nullable: true })
    faqAnswer1: string | null;

    @ApiPropertyOptional({ nullable: true })
    faqQuestion2: string | null;

    @ApiPropertyOptional({ nullable: true })
    faqAnswer2: string | null;

    @ApiPropertyOptional({ nullable: true })
    faqQuestion3: string | null;

    @ApiPropertyOptional({ nullable: true })
    faqAnswer3: string | null;

    @ApiPropertyOptional({ nullable: true })
    faqQuestion4: string | null;

    @ApiPropertyOptional({ nullable: true })
    faqAnswer4: string | null;

    @ApiPropertyOptional({ nullable: true })
    faqQuestion5: string | null;

    @ApiPropertyOptional({ nullable: true })
    faqAnswer5: string | null;

    @ApiPropertyOptional({ nullable: true })
    faqQuestion6: string | null;

    @ApiPropertyOptional({ nullable: true })
    faqAnswer6: string | null;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}
