import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PageType } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class GetCtaSectionQueryDto {
    @ApiProperty({ enum: PageType, description: "Filter by page type (mandatory)" })
    @IsEnum(PageType)
    @IsNotEmpty()
    pageType: PageType;

    @ApiPropertyOptional({ description: "Filter by category ID if pageType is ServiceCategory" })
    @IsOptional()
    @IsString()
    categoryId?: string;
}
