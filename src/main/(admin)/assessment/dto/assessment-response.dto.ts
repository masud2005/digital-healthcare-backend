import type { AssessmentStatus } from "@constant/enums";
import { assessmentStatus } from "@constant/enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AssessmentCategoryResponseDto {
    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    id: string;

    @ApiProperty({ example: "Cardiology" })
    name: string;
}

export class AssessmentResponseDto {
    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    id: string;

    @ApiProperty({ example: "Cardiac Risk Assessment" })
    title: string;

    @ApiPropertyOptional({ example: "https://example.com/assessments/cardiac-risk.png", nullable: true })
    thumbnail: string | null;

    @ApiProperty({ example: "Evaluate cardiac risk factors and symptoms" })
    description: string;

    @ApiProperty({ enum: assessmentStatus, example: "DRAFT" })
    status: AssessmentStatus;

    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    categoryId: string;

    @ApiPropertyOptional({ type: AssessmentCategoryResponseDto })
    category?: AssessmentCategoryResponseDto;

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