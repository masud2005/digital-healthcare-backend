import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class OfficeLocationResponseDto {
    @ApiProperty({ example: "clh1234567890123456789012" })
    id: string;

    @ApiProperty({ example: "clh9999999990123456789012" })
    siteId: string;

    @ApiProperty({ example: "Colorado Springs" })
    name: string;

    @ApiProperty({ example: "1625 Medical Center Point, Suite 120" })
    address: string;

    @ApiPropertyOptional({ example: "Colorado Springs", nullable: true })
    city: string | null;

    @ApiPropertyOptional({ example: "CO", nullable: true })
    state: string | null;

    @ApiPropertyOptional({ example: "80907", nullable: true })
    zipCode: string | null;

    @ApiProperty({ example: true })
    isActive: boolean;

    @ApiPropertyOptional({ example: "https://facebook.com/office", nullable: true })
    facebookUrl: string | null;

    @ApiPropertyOptional({ example: "https://instagram.com/office", nullable: true })
    instagramUrl: string | null;

    @ApiPropertyOptional({ example: "https://twitter.com/office", nullable: true })
    twitterUrl: string | null;

    @ApiPropertyOptional({ example: "https://linkedin.com/office", nullable: true })
    linkedinUrl: string | null;

    @ApiProperty({ example: "2026-05-19T08:00:00.000Z" })
    createdAt: Date;

    @ApiProperty({ example: "2026-05-19T08:00:00.000Z" })
    updatedAt: Date;
}

export class SocialLinkResponseDto {
    @ApiProperty({ example: "clh9876543210987654321098" })
    id: string;

    @ApiProperty({ example: "clh9999999990123456789012" })
    siteId: string;

    @ApiProperty({ example: "facebook" })
    platform: string;

    @ApiProperty({ example: "https://facebook.com/wlmmd" })
    url: string;
}

export class WebsiteSettingsResponseDto {
    @ApiProperty({ example: "clh9999999990123456789012" })
    id: string;

    @ApiProperty({ example: "Weight Loss MD" })
    title: string;

    @ApiPropertyOptional({ example: "Denver's leading weight loss clinic", nullable: true })
    metaDescription: string | null;

    @ApiPropertyOptional({ example: "https://example.com/logo-white.png", nullable: true })
    whiteLogoUrl: string | null;

    @ApiPropertyOptional({ example: "https://example.com/logo-black.png", nullable: true })
    blackLogoUrl: string | null;

    @ApiPropertyOptional({ example: "https://example.com/favicon-light.ico", nullable: true })
    faviconLightUrl: string | null;

    @ApiPropertyOptional({ example: "https://example.com/favicon-dark.ico", nullable: true })
    faviconDarkUrl: string | null;

    @ApiPropertyOptional({ example: "https://example.com/social-preview.jpg", nullable: true })
    socialPreviewUrl: string | null;

    @ApiPropertyOptional({ example: "(720) 279-1104", nullable: true })
    phone: string | null;

    @ApiPropertyOptional({ example: "info@wlmmd.net", nullable: true })
    email: string | null;

    @ApiPropertyOptional({ example: "Mon - Fri: 9AM - 2PM", nullable: true })
    openHours: string | null;

    @ApiPropertyOptional({ example: "Sat - Sun", nullable: true })
    closedDays: string | null;

    @ApiPropertyOptional({ example: "UA-XXXXX-Y", nullable: true })
    gaMeasurementId: string | null;

    @ApiProperty({ type: [OfficeLocationResponseDto] })
    offices: OfficeLocationResponseDto[];

    @ApiProperty({ type: [SocialLinkResponseDto] })
    socialLinks: SocialLinkResponseDto[];

    @ApiProperty({ example: "2026-05-19T08:00:00.000Z" })
    createdAt: Date;

    @ApiProperty({ example: "2026-05-19T08:00:00.000Z" })
    updatedAt: Date;
}
