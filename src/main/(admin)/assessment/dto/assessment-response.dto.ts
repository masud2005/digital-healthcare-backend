import type { AssessmentStatus } from "@constant/enums";
import { assessmentStatus } from "@constant/enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AssessmentCategoryResponseDto {
    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    id: string;

    @ApiProperty({ example: "Cardiology" })
    name: string;
}

export class AssessmentQuestionOptionResponseDto {
    @ApiProperty({ example: "8f8f4f73-9d72-4b76-a1f5-1d0d4b1f7f1e" })
    id: string;

    @ApiProperty({ example: "Less than 30 minutes" })
    label: string;

    @ApiPropertyOptional({ example: "optional note", nullable: true })
    placeholder?: string | null;

    @ApiPropertyOptional({ example: "TEXT", nullable: true })
    inputType?: string | null;

    @ApiPropertyOptional({ type: () => [AssessmentQuestionResponseDto] })
    subQuestions?: AssessmentQuestionResponseDto[];
}

export class AssessmentParentOptionResponseDto {
    @ApiProperty({ example: "2c5d0d63-7d6b-4f5d-9a2f-0c2e5a8d6a12" })
    id: string;

    @ApiProperty({ example: "Less than 30 minutes" })
    label: string;
}

export class AssessmentQuestionResponseDto {
    @ApiProperty({ example: "bf8cfc71-75ff-49e7-8ec8-7b6f099f0dd8" })
    id: string;

    @ApiProperty({ example: "SINGLE_CHOICE" })
    type: string;

    @ApiPropertyOptional({ example: "Lifestyle", nullable: true })
    heading?: string | null;

    @ApiPropertyOptional({ example: "https://example.com/question.png", nullable: true })
    media?: string | null;

    @ApiPropertyOptional({ example: "How active are you each week?", nullable: true })
    questionText?: string | null;

    @ApiPropertyOptional({ example: "Choose the closest answer", nullable: true })
    description?: string | null;

    @ApiPropertyOptional({ example: "LEFT", nullable: true })
    contentAlignment?: string;

    @ApiProperty({ example: true })
    isRequired: boolean;

    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    assessmentId: string;

    @ApiPropertyOptional({ example: "1b9c7e1c-3a9c-4a1e-84d6-4d9f0dc42f63", nullable: true })
    parentOptionId?: string | null;

    @ApiPropertyOptional({ type: AssessmentParentOptionResponseDto, nullable: true })
    parentOption?: AssessmentParentOptionResponseDto | null;

    @ApiProperty({ type: () => [AssessmentQuestionOptionResponseDto] })
    options: AssessmentQuestionOptionResponseDto[];

    @ApiProperty({ example: "2026-05-18T04:00:00.000Z" })
    createdAt: Date;

    @ApiProperty({ example: "2026-05-18T04:00:00.000Z" })
    updatedAt: Date;
}

export class AssessmentResponseDto {
    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    id: string;

    @ApiProperty({ example: "Cardiac Risk Assessment" })
    title: string;

    @ApiPropertyOptional({
        example: "https://example.com/assessments/cardiac-risk.png",
        nullable: true,
    })
    thumbnail: string | null;

    @ApiProperty({ example: "Evaluate cardiac risk factors and symptoms" })
    description: string;

    @ApiProperty({ enum: assessmentStatus, example: "DRAFT" })
    status: AssessmentStatus;

    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    categoryId: string;

    @ApiPropertyOptional({ type: AssessmentCategoryResponseDto })
    category?: AssessmentCategoryResponseDto;

    @ApiPropertyOptional({ type: () => [AssessmentQuestionResponseDto] })
    questions?: AssessmentQuestionResponseDto[];

    @ApiPropertyOptional({ example: "2026-05-18T04:00:00.000Z", nullable: true })
    publishedAt: Date | null;

    @ApiProperty({ example: 12 })
    totalQuestions: number;

    @ApiProperty({ example: 12 })
    totalAssessments: number;

    @ApiProperty({ example: "2026-05-18T04:00:00.000Z" })
    createdAt: Date;

    @ApiProperty({ example: "2026-05-18T04:00:00.000Z" })
    updatedAt: Date;
}

class AssessmentListMetaDto {
    @ApiProperty({ example: 1 })
    page: number;

    @ApiProperty({ example: 10 })
    limit: number;

    @ApiProperty({ example: 25 })
    total: number;

    @ApiProperty({ example: 3 })
    totalPages: number;
}

export class AssessmentListResponseDto {
    @ApiProperty({ type: [AssessmentResponseDto] })
    data: AssessmentResponseDto[];

    @ApiProperty({ type: AssessmentListMetaDto })
    meta: AssessmentListMetaDto;
}

export class AssessmentStatsResponseDto {
    @ApiProperty({ example: 4 })
    activeAssessments: number;

    @ApiProperty({ example: 2 })
    draftAssessments: number;

    @ApiProperty({ example: 1 })
    disabledAssessments: number;

    @ApiProperty({ example: 1250 })
    assessmentTaken: number;

    @ApiProperty({ example: 950 })
    approvedAssessments: number;

    @ApiProperty({ example: 300 })
    declinedAssessments: number;
}
