import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class QuestionOptionResponseDto {
    @ApiProperty() id: string;
    @ApiProperty() label: string;
    @ApiPropertyOptional() placeholder?: string | null;
    @ApiPropertyOptional() inputType?: string | null;
    @ApiProperty() questionId: string;
    @ApiProperty() createdAt: string;
    @ApiProperty() updatedAt: string;
}

export class QuestionOptionListResponseDto {
    @ApiProperty({ type: [QuestionOptionResponseDto] }) data: QuestionOptionResponseDto[];
    @ApiProperty() meta: Record<string, any>;
}
