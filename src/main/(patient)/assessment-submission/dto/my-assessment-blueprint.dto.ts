import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class BlueprintAssessmentDto {
    @ApiProperty({ example: "2d55e1bf-ff32-46f4-b17f-30925f05cbed" })
    id: string;

    @ApiProperty({ example: "Cardiac Risk Assessment" })
    title: string;

    @ApiProperty({ example: "Cardiology" })
    category: string;
}

export class BlueprintPatientAnswerDto {
    @ApiProperty({ type: [String], example: ["8f8f4f73-9d72-4b76-a1f5-1d0d4b1f7f1e"] })
    selectedOptionIds: string[];

    @ApiPropertyOptional({ example: "26", nullable: true })
    textResponse: string | null;
}

export class BlueprintOptionDto {
    @ApiProperty({ example: "b86a72b2-8ad9-4a4f-ba3d-c81a863b0de3" })
    id: string;

    @ApiProperty({ example: "Current age" })
    label: string;

    @ApiPropertyOptional({ example: "NUMBER", nullable: true })
    inputType: string | null;

    @ApiPropertyOptional({ type: () => [BlueprintQuestionDto] })
    subQuestions?: BlueprintQuestionDto[];
}

export class BlueprintQuestionDto {
    @ApiProperty({ example: "d501950d-8fef-403a-84ec-cd677bec0f7a" })
    id: string;

    @ApiProperty({ example: "INPUT" })
    type: string;

    @ApiPropertyOptional({ example: "General Health & Lifestyle Section", nullable: true })
    heading: string | null;

    @ApiPropertyOptional({ example: "What's your age?", nullable: true })
    questionText: string | null;

    @ApiPropertyOptional({ example: "Please answer honestly.", nullable: true })
    description: string | null;

    @ApiProperty({ type: [BlueprintOptionDto] })
    options: BlueprintOptionDto[];

    @ApiPropertyOptional({ type: BlueprintPatientAnswerDto, nullable: true })
    patientAnswer: BlueprintPatientAnswerDto | null;
}

export class BlueprintComplianceConfirmationDto {
    @ApiProperty() agreedToTermsAndPrivacy: boolean;
    @ApiProperty() certifiedInfoAccurate: boolean;
    @ApiProperty() understoodFalseInfoConsequences: boolean;
    @ApiProperty() understoodRecommendationsBasis: boolean;
    @ApiProperty() understoodAdditionalInfoMayBeRequested: boolean;
}

export class BlueprintPaymentProductDto {
    @ApiProperty({ example: "Phentermine" }) name: string;
    @ApiPropertyOptional({ example: "37.5mg", nullable: true }) size: string | null;
    @ApiPropertyOptional({ example: "url", nullable: true }) image: string | null;
    @ApiProperty({ example: 48 }) price: number;
}

export class BlueprintPaymentSummaryDto {
    @ApiProperty({ type: [BlueprintPaymentProductDto] }) products: BlueprintPaymentProductDto[];
    @ApiProperty({ example: 96 }) subtotal: number;
    @ApiPropertyOptional({ example: "1 month", nullable: true }) serviceDuration: string | null;
    @ApiProperty({ example: 50 }) serviceFees: number;
    @ApiProperty({ example: 20 }) shippingCharge: number;
    @ApiProperty({ example: 15 }) discount: number;
    @ApiProperty({ example: 151 }) total: number;
}

export class BlueprintReviewerDto {
    @ApiProperty({ example: "d9b2d63d-a233-4123-84b2-a4f5b210f823" })
    id: string;

    @ApiProperty({ example: "Dr. Runa Pradhan NP" })
    name: string | null;
}

export class MyAssessmentBlueprintDto {
    @ApiProperty({ example: "00b21a00-28d8-4054-8c45-f074d2bfbbf1" })
    submissionId: string;

    @ApiProperty({ example: "ASM-2026-41674" })
    submissionCode: string;

    @ApiProperty({ example: "DRAFT" })
    status: string;

    @ApiProperty({ example: true })
    isEditable: boolean;

    @ApiProperty({ example: "2026-06-19T00:00:00.000Z" })
    submissionDate: Date;

    @ApiPropertyOptional({ example: "John Doe", nullable: true })
    name: string | null;

    @ApiPropertyOptional({ example: "url", nullable: true })
    patientImage: string | null;

    @ApiProperty({ type: BlueprintAssessmentDto })
    assessment: BlueprintAssessmentDto;

    @ApiProperty({ type: [BlueprintQuestionDto] })
    questions: BlueprintQuestionDto[];

    @ApiPropertyOptional({ type: BlueprintComplianceConfirmationDto, nullable: true })
    complianceConfirmation: BlueprintComplianceConfirmationDto | null;

    @ApiPropertyOptional({ type: BlueprintPaymentSummaryDto, nullable: true })
    paymentSummary: BlueprintPaymentSummaryDto | null;

    @ApiPropertyOptional({ type: BlueprintReviewerDto, nullable: true })
    reviewedBy: BlueprintReviewerDto | null;

    @ApiPropertyOptional({ example: "Looks good to me.", nullable: true })
    doctorNotes: string | null;
}

export class MyAssessmentListCategoryDto {
    @ApiProperty({ example: "d9b2d63d-a233-4123-84b2-a4f5b210f823" })
    id: string;

    @ApiProperty({ example: "Hormone Therapy" })
    name: string;
}

export class MyAssessmentListAssessmentDto {
    @ApiProperty({ example: "f43ce7a9-39da-4a58-8e8f-2f40fd8b2d2a" })
    id: string;

    @ApiProperty({ example: "Weight Loss" })
    title: string;

    @ApiProperty({ example: "Assessment description" })
    description: string | null;

    @ApiProperty({ example: "url", nullable: true })
    thumbnail: string | null;

    @ApiProperty({ type: MyAssessmentListCategoryDto })
    category: MyAssessmentListCategoryDto;
}

export class MyAssessmentListItemDto {
    @ApiProperty({ example: "00b21a00-28d8-4054-8c45-f074d2bfbbf1" })
    id: string;

    @ApiProperty({ example: "ASM-2026-41674" })
    submissionCode: string;

    @ApiProperty({ example: "ACCEPTED" })
    status: string;

    @ApiProperty({ example: "2026-06-19T00:00:00.000Z" })
    createdAt: Date;

    @ApiProperty({ type: MyAssessmentListAssessmentDto })
    assessment: MyAssessmentListAssessmentDto;

    @ApiPropertyOptional({ type: BlueprintReviewerDto, nullable: true })
    reviewedBy: BlueprintReviewerDto | null;

    @ApiPropertyOptional({ example: "Looks good to me.", nullable: true })
    doctorNotes: string | null;
}

export class MyAssessmentSummaryResponseDto {
    @ApiProperty({ type: [MyAssessmentListItemDto] })
    submissions: MyAssessmentListItemDto[];

    @ApiProperty({
        description: "Counts of submissions grouped by status",
        example: {
            ACCEPTED: 5,
            PENDING: 2,
            REFIL_REQUESTED: 1,
            REJECTED: 1,
        },
    })
    counts: Record<string, number>;
}
