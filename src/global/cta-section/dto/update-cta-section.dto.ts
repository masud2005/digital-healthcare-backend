import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsOptional, IsString, IsUrl } from "class-validator";
import { PageType } from "@prisma/client";

export class UpdateCtaSectionDto {
    @ApiPropertyOptional({ enum: PageType })
    @IsOptional()
    @IsEnum(PageType)
    page?: PageType;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    sectionTitle?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    ctaButtonText?: string;

    @ApiPropertyOptional()
    @IsOptional()
    url?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    openInNewTab?: boolean;
}
