import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsString, ValidateNested } from "class-validator";

export class SocialLinkDto {
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
