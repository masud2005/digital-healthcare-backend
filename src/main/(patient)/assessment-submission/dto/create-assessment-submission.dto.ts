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
    @ApiProperty({
        example: "bf8cfc71-75ff-49e7-8ec8-7b6f099f0dd8",
        description: "Question id from the selected assessment. Do not send INFORMATION_ONLY question ids.",
    })
    @IsUUID()
    questionId: string;

    @ApiPropertyOptional({
        example: "I walk 3 times a week",
        description:
            "Required for INPUT questions. For attachment/file answers, upload through POST /attachments/upload with context ASSESSMENT_FILE first, then send the returned attachment data.id or data.fileUrl string here.",
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    textResponse?: string;

    @ApiPropertyOptional({
        example: ["8f8f4f73-9d72-4b76-a1f5-1d0d4b1f7f1e"],
        type: [String],
        description:
            "Required for choice questions. SINGLE_CHOICE accepts exactly one option id; MULTIPLE_CHOICE accepts one or more.",
    })
    @IsOptional()
    @IsArray()
    @IsUUID("all", { each: true })
    selectedOptionIds?: string[];
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
