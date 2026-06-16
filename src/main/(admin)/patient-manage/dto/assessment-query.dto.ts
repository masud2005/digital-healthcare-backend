import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";
import { SubmissionStatus } from "@prisma/client";

export enum DateFilter {
    TODAY = "today",
    ALL = "all",
}

export class PatientAssessmentQueryDto {
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

    @ApiPropertyOptional({ enum: SubmissionStatus, example: "PENDING" })
    @IsOptional()
    @IsEnum(SubmissionStatus)
    status?: SubmissionStatus;

    @ApiPropertyOptional({ example: "category-uuid" })
    @IsOptional()
    @IsString()
    categoryId?: string;

    @ApiPropertyOptional({ example: "New Patient", description: "New Patient or Repeat Patient" })
    @IsOptional()
    @IsString()
    patientType?: string;

    @ApiPropertyOptional({ enum: DateFilter, example: "today" })
    @IsOptional()
    @IsEnum(DateFilter)
    date?: DateFilter;

    @ApiPropertyOptional({ example: "john" })
    @IsOptional()
    @IsString()
    search?: string;
}
