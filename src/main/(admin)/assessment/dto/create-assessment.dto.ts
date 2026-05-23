import type { AssessmentStatus } from "@constant/enums";
import { assessmentStatus } from "@constant/enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateAssessmentDto {
    @ApiProperty({ example: "Cardiac Risk Assessment" })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiPropertyOptional({
        type: "string",
        format: "binary",
        description: "Assessment thumbnail file",
    })
    @IsOptional()
    @IsString()
    thumbnail?: string;

    @ApiProperty({ example: "Evaluate cardiac risk factors and symptoms" })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiPropertyOptional({ enum: assessmentStatus, example: "DRAFT" })
    @IsOptional()
    @IsEnum(assessmentStatus)
    status?: AssessmentStatus;

    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    @IsUUID()
    categoryId: string;
}