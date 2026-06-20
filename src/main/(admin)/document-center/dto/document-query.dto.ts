import { attachmentContext, type AttachmentContext } from "@constant/enums";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";

export enum DocumentDateFilter {
    TODAY = "today",
    LAST_7_DAYS = "last_7_days",
    LAST_MONTH = "last_month",
    LAST_YEAR = "last_year",
    ALL = "all",
}

export class DocumentQueryDto {
    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @ApiPropertyOptional({ example: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number;

    @ApiPropertyOptional({ enum: attachmentContext })
    @IsOptional()
    @IsEnum(attachmentContext)
    type?: AttachmentContext;

    @ApiPropertyOptional({ enum: DocumentDateFilter, example: DocumentDateFilter.ALL })
    @IsOptional()
    @IsEnum(DocumentDateFilter)
    date?: DocumentDateFilter;

    @ApiPropertyOptional({ example: "john" })
    @IsOptional()
    @IsString()
    search?: string;
}
