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

    @ApiProperty({ example: true })
    isActive: boolean;

    @ApiProperty({ example: "2026-05-19T08:00:00.000Z" })
    createdAt: Date;

    @ApiProperty({ example: "2026-05-19T08:00:00.000Z" })
    updatedAt: Date;
}

export class ContactInfoResponseDto {
    @ApiProperty({ example: "cmqq4mlzi0000lesaw89yc4wz" })
    siteId: string;

    @ApiPropertyOptional({ example: "(720) 277-9614", nullable: true })
    phone: string | null;

    @ApiPropertyOptional({ example: "info@wlmd.net", nullable: true })
    email: string | null;

    @ApiPropertyOptional({ example: "Mon - Fri : 9AM - 2PM, 3PM - 6PM", nullable: true })
    openHours: string | null;

    @ApiPropertyOptional({ example: "Sat - Sun", nullable: true })
    closedDays: string | null;
}

export class GoogleAnalyticsResponseDto {
    @ApiProperty({ example: "cmqq4mlzi0000lesaw89yc4wz" })
    siteId: string;

    @ApiPropertyOptional({ example: "G-XXXXXXXXXX", nullable: true })
    gaMeasurementId: string | null;
}

export class SocialLinkResponseDto {
    @ApiProperty({ example: "facebook" })
    name: string;

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

    @ApiPropertyOptional({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f", nullable: true })
    whiteLogoId: string | null;

    @ApiPropertyOptional({ type: AttachmentResponseDto, nullable: true })
    whiteLogo: AttachmentResponseDto | null;

    @ApiPropertyOptional({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f", nullable: true })
    blackLogoId: string | null;

    @ApiPropertyOptional({ type: AttachmentResponseDto, nullable: true })
    blackLogo: AttachmentResponseDto | null;

    @ApiPropertyOptional({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f", nullable: true })
    faviconLightId: string | null;

    @ApiPropertyOptional({ type: AttachmentResponseDto, nullable: true })
    faviconLight: AttachmentResponseDto | null;

    @ApiPropertyOptional({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f", nullable: true })
    faviconDarkId: string | null;

    @ApiPropertyOptional({ type: AttachmentResponseDto, nullable: true })
    faviconDark: AttachmentResponseDto | null;

    @ApiPropertyOptional({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f", nullable: true })
    socialPreviewId: string | null;

    @ApiPropertyOptional({ type: AttachmentResponseDto, nullable: true })
    socialPreview: AttachmentResponseDto | null;

    @ApiProperty({ type: [OfficeLocationResponseDto] })
    offices: OfficeLocationResponseDto[];

    @ApiProperty({ type: ContactInfoResponseDto })
    contactInfo: ContactInfoResponseDto;

    @ApiProperty({ type: GoogleAnalyticsResponseDto })
    googleAnalytics: GoogleAnalyticsResponseDto;

    @ApiProperty({ type: [SocialLinkResponseDto] })
    socialLinks: SocialLinkResponseDto[];

    @ApiProperty({ example: "2026-05-19T08:00:00.000Z" })
    createdAt: Date;

    @ApiProperty({ example: "2026-05-19T08:00:00.000Z" })
    updatedAt: Date;
}
