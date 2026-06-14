import type { AssessmentStatus } from "@constant/enums";
import { assessmentStatus } from "@constant/enums";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class AssessmentQueryDto {
    @ApiPropertyOptional({ enum: assessmentStatus, example: "DRAFT" })
    @IsOptional()
    @IsEnum(assessmentStatus)
    status?: AssessmentStatus;

    @ApiPropertyOptional({ example: "Cardiology" })
    @IsOptional()
    @IsString()
    categoryName?: string;

    @ApiPropertyOptional({ example: 1, type: Number })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @ApiPropertyOptional({ example: 10, type: Number })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number;
}
