import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator";

export class SocialLinkDto {
    @IsOptional()
    @IsString()
    id?: string;

    @IsOptional()
    @IsString()
    siteId?: string;

    @ApiProperty({ example: "facebook" })
    @IsString()
    name: string;

    @ApiProperty({ example: "https://facebook.com/wlmmd" })
    @IsString()
    url: string;
}

export class UpdateSocialLinksDto {
    @ApiProperty({ type: [SocialLinkDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SocialLinkDto)
    socialLinks: SocialLinkDto[];
}
