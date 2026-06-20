import { AttachmentResponseDto } from "@global/attachment/dto/attachment-response.dto";
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

export class WebsiteSettingsResponseDto {
    @ApiProperty({ example: "clh9999999990123456789012" })
    id: string;

    @ApiProperty({ example: "Weight Loss MD" })
    title: string;

    @ApiPropertyOptional({ example: "Denver's leading weight loss clinic", nullable: true })
    metaDescription: string | null;

    @ApiPropertyOptional({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f", nullable: true })
    whiteLogoId: string | null;

    @ApiPropertyOptional({ type: AttachmentResponseDto, nullable: true })
    whiteLogo: AttachmentResponseDto | null;

    @ApiPropertyOptional({ example: "https://example.com/logo-white.png", nullable: true })
    whiteLogoUrl: string | null;

    @ApiPropertyOptional({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f", nullable: true })
    blackLogoId: string | null;

    @ApiPropertyOptional({ type: AttachmentResponseDto, nullable: true })
    blackLogo: AttachmentResponseDto | null;

    @ApiPropertyOptional({ example: "https://example.com/logo-black.png", nullable: true })
    blackLogoUrl: string | null;

    @ApiPropertyOptional({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f", nullable: true })
    faviconLightId: string | null;

    @ApiPropertyOptional({ type: AttachmentResponseDto, nullable: true })
    faviconLight: AttachmentResponseDto | null;

    @ApiPropertyOptional({ example: "https://example.com/favicon-light.ico", nullable: true })
    faviconLightUrl: string | null;

    @ApiPropertyOptional({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f", nullable: true })
    faviconDarkId: string | null;

    @ApiPropertyOptional({ type: AttachmentResponseDto, nullable: true })
    faviconDark: AttachmentResponseDto | null;

    @ApiPropertyOptional({ example: "https://example.com/favicon-dark.ico", nullable: true })
    faviconDarkUrl: string | null;

    @ApiPropertyOptional({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f", nullable: true })
    socialPreviewId: string | null;

    @ApiPropertyOptional({ type: AttachmentResponseDto, nullable: true })
    socialPreview: AttachmentResponseDto | null;

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

    @ApiPropertyOptional({ example: "https://facebook.com/wlmmd", nullable: true })
    facebookUrl: string | null;

    @ApiPropertyOptional({ example: "https://instagram.com/wlmmd", nullable: true })
    instagramUrl: string | null;

    @ApiPropertyOptional({ example: "https://twitter.com/wlmmd", nullable: true })
    twitterUrl: string | null;

    @ApiPropertyOptional({ example: "https://linkedin.com/wlmmd", nullable: true })
    linkedinUrl: string | null;

    @ApiProperty({ example: "2026-05-19T08:00:00.000Z" })
    createdAt: Date;

    @ApiProperty({ example: "2026-05-19T08:00:00.000Z" })
    updatedAt: Date;
}
