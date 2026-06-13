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

export class MyAssessmentBlueprintDto {
    @ApiProperty({ example: "00b21a00-28d8-4054-8c45-f074d2bfbbf1" })
    submissionId: string;

    @ApiProperty({ example: "A3K9P2" })
    submissionCode: string;

    @ApiProperty({ example: "DRAFT" })
    status: string;

    @ApiProperty({ example: true })
    isEditable: boolean;

    @ApiProperty({ type: BlueprintAssessmentDto })
    assessment: BlueprintAssessmentDto;

    @ApiProperty({ type: [BlueprintQuestionDto] })
    questions: BlueprintQuestionDto[];
}
