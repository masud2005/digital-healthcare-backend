import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { PageType } from "@prisma/client";

export class UpdateHeroSectionDto {
    @ApiPropertyOptional({ enum: PageType })
    @IsOptional()
    @IsEnum(PageType)
    page?: PageType;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;
}
