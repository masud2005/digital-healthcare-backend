import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
    ArrayMinSize,
    IsArray,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    ValidateNested,
} from "class-validator";

export class AssessmentSubmissionAnswerInputDto {
    @ApiProperty({ example: "bf8cfc71-75ff-49e7-8ec8-7b6f099f0dd8" })
    @IsUUID()
    questionId: string;

    @ApiPropertyOptional({ example: "I walk 3 times a week" })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    textResponse?: string;

    @ApiPropertyOptional({
        example: ["8f8f4f73-9d72-4b76-a1f5-1d0d4b1f7f1e"],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsUUID("all", { each: true })
    selectedOptionIds?: string[];

    @ApiPropertyOptional({ example: "file_photo_1", nullable: true })
    @IsOptional()
    @IsString()
    fileField?: string;
}

export class CreateAssessmentSubmissionDto {
    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    @IsUUID()
    assessmentId: string;

    @ApiProperty({ type: [AssessmentSubmissionAnswerInputDto] })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => AssessmentSubmissionAnswerInputDto)
    answers: AssessmentSubmissionAnswerInputDto[];
}
