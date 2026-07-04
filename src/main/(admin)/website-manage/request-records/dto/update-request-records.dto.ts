import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator";

export class RequestRecordItemDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    text?: string;
}

export class RequestRecordWidgetDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional({ type: [RequestRecordItemDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RequestRecordItemDto)
    items?: RequestRecordItemDto[];
}

export class UpdateRequestRecordsDto {
    @ApiPropertyOptional({ type: [RequestRecordWidgetDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RequestRecordWidgetDto)
    widgets?: RequestRecordWidgetDto[];
}
