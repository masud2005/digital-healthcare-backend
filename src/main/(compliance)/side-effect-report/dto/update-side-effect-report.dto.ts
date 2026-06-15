import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { CreateSideEffectReportDto } from "./create-side-effect-report.dto";
import { IsArray, IsOptional, IsString } from "class-validator";

export class UpdateSideEffectReportDto extends PartialType(CreateSideEffectReportDto) {
    @ApiPropertyOptional({ type: [String], example: [] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    attachmentIds?: string[];
}
