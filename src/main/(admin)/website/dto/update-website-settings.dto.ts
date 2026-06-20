import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsArray, IsBoolean, IsOptional, IsString, ValidateNested } from "class-validator";

export class OfficeLocationDto {
    @ApiPropertyOptional({ example: "clh1234567890123456789012" })
    @IsOptional()
    @IsString()
    id?: string;

    @ApiProperty({ example: "Colorado Springs" })
    @IsString()
    name: string;

    @ApiProperty({ example: "1625 Medical Center Point, Suite 120" })
    @IsString()
    address: string;

    @ApiPropertyOptional({ example: "Colorado Springs" })
    @IsOptional()
    @IsString()
    city?: string;

    @ApiPropertyOptional({ example: "CO" })
    @IsOptional()
    @IsString()
    state?: string;

    @ApiPropertyOptional({ example: "80907" })
    @IsOptional()
    @IsString()
    zipCode?: string;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({ example: "https://facebook.com/office" })
    @IsOptional()
    @IsString()
    facebookUrl?: string;

    @ApiPropertyOptional({ example: "https://instagram.com/office" })
    @IsOptional()
    @IsString()
    instagramUrl?: string;

    @ApiPropertyOptional({ example: "https://twitter.com/office" })
    @IsOptional()
    @IsString()
    twitterUrl?: string;

    @ApiPropertyOptional({ example: "https://linkedin.com/office" })
    @IsOptional()
    @IsString()
    linkedinUrl?: string;
}

export class UpdateWebsiteSettingsDto {
    @ApiPropertyOptional({ example: "Weight Loss MD" })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional({ example: "Denver's leading weight loss clinic" })
    @IsOptional()
    @IsString()
    metaDescription?: string;

    @ApiPropertyOptional({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    @IsOptional()
    @IsString()
    whiteLogoId?: string;

    @ApiPropertyOptional({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    @IsOptional()
    @IsString()
    blackLogoId?: string;

    @ApiPropertyOptional({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    @IsOptional()
    @IsString()
    faviconLightId?: string;

    @ApiPropertyOptional({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    @IsOptional()
    @IsString()
    faviconDarkId?: string;

    @ApiPropertyOptional({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    @IsOptional()
    @IsString()
    socialPreviewId?: string;

    @ApiPropertyOptional({ example: "(720) 279-1104" })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({ example: "info@wlmmd.net" })
    @IsOptional()
    @IsString()
    email?: string;

    @ApiPropertyOptional({ example: "Mon - Fri: 9AM - 2PM" })
    @IsOptional()
    @IsString()
    openHours?: string;

    @ApiPropertyOptional({ example: "Sat - Sun" })
    @IsOptional()
    @IsString()
    closedDays?: string;

    @ApiPropertyOptional({ example: "UA-XXXXX-Y" })
    @IsOptional()
    @IsString()
    gaMeasurementId?: string;

    @ApiPropertyOptional({ type: [OfficeLocationDto] })
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
    @Type(() => OfficeLocationDto)
    offices?: OfficeLocationDto[];

    @ApiPropertyOptional({ example: "https://facebook.com/wlmmd" })
    @IsOptional()
    @IsString()
    facebookUrl?: string;

    @ApiPropertyOptional({ example: "https://instagram.com/wlmmd" })
    @IsOptional()
    @IsString()
    instagramUrl?: string;

    @ApiPropertyOptional({ example: "https://twitter.com/wlmmd" })
    @IsOptional()
    @IsString()
    twitterUrl?: string;

    @ApiPropertyOptional({ example: "https://linkedin.com/wlmmd" })
    @IsOptional()
    @IsString()
    linkedinUrl?: string;
}
