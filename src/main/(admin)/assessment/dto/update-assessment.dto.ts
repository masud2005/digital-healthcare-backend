import type { AssessmentStatus } from "@constant/enums";
import { assessmentStatus } from "@constant/enums";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class UpdateAssessmentDto {
    @ApiPropertyOptional({ example: "Cardiac Risk Assessment" })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    title?: string;

    @ApiPropertyOptional({
        type: "string",
        format: "binary",
        nullable: true,
        description: "Assessment thumbnail file (or omit to keep existing)",
    })
    @IsOptional()
    @IsString()
    thumbnail?: string | null;

    @ApiPropertyOptional({ example: "Evaluate cardiac risk factors and symptoms" })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    description?: string;

    @ApiPropertyOptional({ enum: assessmentStatus, example: "ACTIVE" })
    @IsOptional()
    @IsEnum(assessmentStatus)
    status?: AssessmentStatus;

    @ApiPropertyOptional({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    @IsOptional()
    @IsUUID()
    categoryId?: string;
}