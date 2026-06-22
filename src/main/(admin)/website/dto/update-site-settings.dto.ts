import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateSiteSettingsDto {
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
}
