import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AssessmentSubmissionSelectedOptionResponseDto {
    @ApiProperty({ example: "7ac8d7e2-4c27-4cb1-b1d4-1c4a0a0c7f6f" })
    id: string;

    @ApiProperty({ example: "8f8f4f73-9d72-4b76-a1f5-1d0d4b1f7f1e" })
    optionId: string;

    @ApiProperty({ example: "Less than 30 minutes" })
    optionLabel: string;
}

export class AssessmentSubmissionAnswerResponseDto {
    @ApiProperty({ example: "9c2d34a5-f6eb-4c7e-9e3d-7dcb1cf0de69" })
    id: string;

    @ApiProperty({ example: "bf8cfc71-75ff-49e7-8ec8-7b6f099f0dd8" })
    questionId: string;

    @ApiPropertyOptional({ example: "I walk 3 times a week", nullable: true })
    textResponse: string | null;

    @ApiProperty({ type: [AssessmentSubmissionSelectedOptionResponseDto] })
    selectedOptions: AssessmentSubmissionSelectedOptionResponseDto[];

    @ApiProperty({ example: "2026-05-20T00:00:00.000Z" })
    createdAt: Date;
}

export class AssessmentSubmissionUserResponseDto {
    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    id: string;

    @ApiProperty({ example: "John Doe" })
    name: string;

    @ApiProperty({ example: "john@example.com" })
    email: string;
}

export class AssessmentSubmissionAssessmentResponseDto {
    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    id: string;

    @ApiProperty({ example: "Cardiac Risk Assessment" })
    title: string;
}

export class AssessmentSubmissionResponseDto {
    @ApiProperty({ example: "f43ce7a9-39da-4a58-8e8f-2f40fd8b2d2a" })
    id: string;

    @ApiProperty({ example: "ASM-2026-41674" })
    submissionCode: string;

    @ApiProperty({ example: "PENDING" })
    status: string;

    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    userId: string;

    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    assessmentId: string;

    @ApiPropertyOptional({ type: AssessmentSubmissionUserResponseDto })
    user?: AssessmentSubmissionUserResponseDto;

    @ApiPropertyOptional({ type: AssessmentSubmissionAssessmentResponseDto })
    assessment?: AssessmentSubmissionAssessmentResponseDto;

    @ApiProperty({ type: [AssessmentSubmissionAnswerResponseDto] })
    answers: AssessmentSubmissionAnswerResponseDto[];

    @ApiPropertyOptional({ example: null, nullable: true })
    reviewedBy: string | null;

    @ApiPropertyOptional({ example: null, nullable: true })
    reviewedAt: Date | null;

    @ApiPropertyOptional({ example: null, nullable: true })
    doctorNotes: string | null;

    @ApiProperty({ example: "2026-05-20T00:00:00.000Z" })
    createdAt: Date;

    @ApiProperty({ example: "2026-05-20T00:00:00.000Z" })
    updatedAt: Date;
}
