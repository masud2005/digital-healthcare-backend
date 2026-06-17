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

export class UpdateSubmissionAnswerInputDto {
    @ApiProperty({
        example: "bf8cfc71-75ff-49e7-8ec8-7b6f099f0dd8",
        description:
            "The id of the question being answered. " +
            "INFORMATION_ONLY — omit entirely, do not include in answers array. " +
            "INPUT — include with textResponse only. " +
            "SINGLE_CHOICE — include with selectedOptionIds containing exactly one id. " +
            "MULTIPLE_CHOICE — include with selectedOptionIds containing one or more ids.",
    })
    @IsUUID()
    questionId: string;

    @ApiPropertyOptional({
        example: "I walk 3 times a week",
        description:
            "Required for INPUT type questions only. Must NOT be sent for SINGLE_CHOICE or MULTIPLE_CHOICE. " +
            "For questions with inputType FILE: upload the file first via POST /attachments/upload " +
            "with context ASSESSMENT_FILE, then pass the returned data.id or data.fileUrl here.",
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    textResponse?: string;

    @ApiPropertyOptional({
        example: ["8f8f4f73-9d72-4b76-a1f5-1d0d4b1f7f1e"],
        type: [String],
        description:
            "Required for SINGLE_CHOICE and MULTIPLE_CHOICE questions only. Must NOT be sent for INPUT. " +
            "SINGLE_CHOICE: exactly one option id. " +
            "MULTIPLE_CHOICE: one or more option ids. " +
            "Each id must belong to the options list of the submitted question.",
    })
    @IsOptional()
    @IsArray()
    @IsUUID("all", { each: true })
    selectedOptionIds?: string[];
}

export class UpdateAssessmentSubmissionDto {
    @ApiProperty({
        type: [UpdateSubmissionAnswerInputDto],
        description:
            "Replaces ALL existing answers for this submission. " +
            "Send the complete updated answers array — partial updates are not supported. " +
            "INFORMATION_ONLY questions must be omitted. " +
            "Sub-questions must only be included when their parent option is selected. " +
            "Duplicate questionIds are not allowed.",
    })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => UpdateSubmissionAnswerInputDto)
    answers: UpdateSubmissionAnswerInputDto[];
}
