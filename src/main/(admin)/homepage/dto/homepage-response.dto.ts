import { AttachmentResponseDto } from "@global/attachment/dto/attachment-response.dto";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class HowItWorksStepResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    homePageContentId: string;

    @ApiProperty()
    title: string;

    @ApiPropertyOptional({ nullable: true })
    description: string | null;

    @ApiPropertyOptional({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f", nullable: true })
    iconId: string | null;

    @ApiPropertyOptional({ type: AttachmentResponseDto, nullable: true })
    icon: AttachmentResponseDto | null;

    @ApiPropertyOptional({ nullable: true })
    iconUrl: string | null;

    @ApiProperty()
    order: number;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}

export class HomePageFaqResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    homePageContentId: string;

    @ApiProperty()
    question: string;

    @ApiProperty()
    answer: string;

    @ApiProperty()
    order: number;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}

export class HomePageContentResponseDto {
    @ApiProperty()
    id: string;

    @ApiPropertyOptional({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f", nullable: true })
    heroImageId: string | null;

    @ApiPropertyOptional({ type: AttachmentResponseDto, nullable: true })
    heroImage: AttachmentResponseDto | null;

    @ApiPropertyOptional({ nullable: true })
    heroImageUrl: string | null;

    @ApiPropertyOptional({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f", nullable: true })
    heroBadgeImageId: string | null;

    @ApiPropertyOptional({ type: AttachmentResponseDto, nullable: true })
    heroBadgeImage: AttachmentResponseDto | null;

    @ApiPropertyOptional({ nullable: true })
    heroBadgeImageUrl: string | null;

    @ApiPropertyOptional({ nullable: true })
    heroBadgeText: string | null;

    @ApiPropertyOptional({ nullable: true })
    heroBadgeLink: string | null;

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

    @ApiPropertyOptional({ nullable: true })
    bannerTitle: string | null;

    @ApiPropertyOptional({ nullable: true })
    bannerDescription: string | null;

    @ApiPropertyOptional({ nullable: true })
    aboutSubtitle: string | null;

    @ApiPropertyOptional({ nullable: true })
    aboutTitle: string | null;

    @ApiPropertyOptional({ nullable: true })
    aboutDescription: string | null;

    @ApiPropertyOptional({ nullable: true })
    aboutPrimaryButtonText: string | null;

    @ApiPropertyOptional({ nullable: true })
    aboutPrimaryButtonLink: string | null;

    @ApiProperty()
    aboutPrimaryButtonNewTab: boolean;

    @ApiPropertyOptional({ nullable: true })
    aboutSecondaryButtonText: string | null;

    @ApiPropertyOptional({ nullable: true })
    aboutSecondaryButtonLink: string | null;

    @ApiProperty()
    aboutSecondaryButtonNewTab: boolean;

    @ApiProperty({ type: [String] })
    aboutBullets: string[];

    @ApiPropertyOptional({ nullable: true })
    productTitle: string | null;

    @ApiPropertyOptional({ nullable: true })
    productButtonLink: string | null;

    @ApiProperty()
    productButtonNewTab: boolean;

    @ApiPropertyOptional({ nullable: true })
    howItWorksTitle: string | null;

    @ApiProperty({ type: [HowItWorksStepResponseDto] })
    howItWorksSteps: HowItWorksStepResponseDto[];

    @ApiPropertyOptional({ nullable: true })
    testimonialTitle: string | null;

    @ApiPropertyOptional({ nullable: true })
    testimonialSubtitle: string | null;

    @ApiPropertyOptional({ nullable: true })
    testimonialDescription: string | null;

    @ApiPropertyOptional({ nullable: true })
    testimonialButtonLink: string | null;

    @ApiProperty()
    testimonialButtonNewTab: boolean;

    @ApiPropertyOptional({ nullable: true })
    pricingTitle: string | null;

    @ApiPropertyOptional({ nullable: true })
    pricingSubtitle: string | null;

    @ApiPropertyOptional({ nullable: true })
    pricingDescription: string | null;

    @ApiPropertyOptional({ nullable: true })
    pricingButtonLink: string | null;

    @ApiProperty()
    pricingButtonNewTab: boolean;

    @ApiProperty({ type: [HomePageFaqResponseDto] })
    faqs: HomePageFaqResponseDto[];

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}
