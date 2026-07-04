import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PageType } from "@prisma/client";
import { Type } from "class-transformer";
import {
    IsArray,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    ValidateNested,
} from "class-validator";

export class FaqItemDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    question: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    answer: string;
}

export class UpdateFaqDto {
    @ApiProperty({ enum: PageType })
    @IsEnum(PageType)
    @IsNotEmpty()
    pageType: PageType;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    sectionTitle?: string;

    @ApiPropertyOptional({ type: [FaqItemDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FaqItemDto)
    faqs?: FaqItemDto[];
}
