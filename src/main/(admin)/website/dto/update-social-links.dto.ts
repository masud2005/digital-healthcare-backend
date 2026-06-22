import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateSocialLinksDto {
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
