import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID } from "class-validator";
import { PageType } from "@prisma/client";

export class UpdateSideWidgetDto {
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
    buttonText?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    buttonUrl?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isBlank?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    imageId?: string;
}
