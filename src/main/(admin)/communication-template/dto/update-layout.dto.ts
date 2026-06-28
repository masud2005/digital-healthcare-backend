import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsOptional, IsString, IsUUID } from "class-validator";

export class UpdateLayoutDto {
    // Brand & Header
    @ApiPropertyOptional({ description: "ID of the custom logo attachment", example: "uuid" })
    @IsUUID()
    @IsOptional()
    logoId?: string;

    @ApiPropertyOptional({
        description: "If true, logo background is white. If false, it uses dark background.",
        example: true,
    })
    @IsBoolean()
    @IsOptional()
    isBlack?: boolean;

    @ApiPropertyOptional({
        description: "Brand name shown at the top of every email",
        example: "WEIGHTLOSSMD",
    })
    @IsString()
    @IsOptional()
    brandName?: string;

    @ApiPropertyOptional({
        description: "Default header title (can be overridden per template)",
        example: "System Notification",
    })
    @IsString()
    @IsOptional()
    headerTitle?: string;

    @ApiPropertyOptional({
        description: "Default header subtitle shown below the title",
        example: "We have an important update regarding your account.",
    })
    @IsString()
    @IsOptional()
    headerSubtitle?: string;

    // Footer
    @ApiPropertyOptional({
        description: "Company name shown in the footer",
        example: "WeightLossMD Support",
    })
    @IsString()
    @IsOptional()
    footerCompanyName?: string;

    @ApiPropertyOptional({
        description: "Support email shown in the footer",
        example: "support@weightlossmd.com",
    })
    @IsEmail()
    @IsOptional()
    footerEmail?: string;

    @ApiPropertyOptional({
        description: "Tagline / disclaimer shown at the bottom of every email",
        example: "This is an automated message. Please do not reply to this email.",
    })
    @IsString()
    @IsOptional()
    footerTagline?: string;

    @ApiPropertyOptional({ description: "Whether the global layout is active" })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
