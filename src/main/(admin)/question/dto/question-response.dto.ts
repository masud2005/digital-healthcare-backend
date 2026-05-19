import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

class QuestionOptionDto {
    @ApiProperty() id: string;
    @ApiProperty() label: string;
    @ApiPropertyOptional() placeholder?: string | null;
    @ApiPropertyOptional() inputType?: string | null;
}

class ParentOptionDto {
    @ApiProperty() id: string;
    @ApiProperty() label: string;
}

export class QuestionResponseDto {
    @ApiProperty() id: string;
    @ApiProperty() type: string;
    @ApiPropertyOptional() heading?: string | null;
    @ApiPropertyOptional() media?: string | null;
    @ApiPropertyOptional() questionText?: string | null;
    @ApiPropertyOptional() description?: string | null;
    @ApiPropertyOptional() contentAlignment?: string;
    @ApiProperty() isRequired: boolean;
    @ApiProperty() assessmentId: string;
    @ApiPropertyOptional() parentOption?: ParentOptionDto | null;
    @ApiProperty({ type: [QuestionOptionDto] }) options: QuestionOptionDto[];
    @ApiProperty() createdAt: string;
    @ApiProperty() updatedAt: string;
}

export class QuestionListResponseDto {
    @ApiProperty({ type: [QuestionResponseDto] }) data: QuestionResponseDto[];
    @ApiProperty() meta: Record<string, any>;
}
