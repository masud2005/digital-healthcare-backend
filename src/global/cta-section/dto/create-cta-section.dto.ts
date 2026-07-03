import { ApiProperty } from "@nestjs/swagger";
import { PageType } from "@prisma/client";
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCtaSectionDto {
    @ApiProperty({ enum: PageType, description: "The page type for the CTA section" })
    @IsEnum(PageType)
    @IsNotEmpty()
    page: PageType;

    @ApiProperty({ description: "Title of the CTA section" })
    @IsString()
    @IsNotEmpty()
    sectionTitle: string;

    @ApiProperty({ description: "Text for the CTA button" })
    @IsString()
    @IsNotEmpty()
    ctaButtonText: string;

    @ApiProperty({ description: "URL for the CTA button" })
    @IsString()
    @IsNotEmpty()
    url: string;

    @ApiProperty({ description: "Whether to open in new tab", required: false, default: false })
    @IsBoolean()
    @IsOptional()
    openInNewTab?: boolean;
}
