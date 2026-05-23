import type { Alignment, QuestionType } from "@constant/enums";
import { alignment, questionType } from "@constant/enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateQuestionDto {
    @ApiProperty({ enum: questionType })
    @IsEnum(questionType)
    type: QuestionType;

    @ApiPropertyOptional({ example: "Section Heading" })
    @IsOptional()
    @IsString()
    heading?: string;

    @ApiPropertyOptional({
        type: "string",
        format: "binary",
        description: "Question media file",
    })
    @IsOptional()
    @IsString()
    media?: string;

    @ApiPropertyOptional({ example: "What is your age?" })
    @IsOptional()
    @IsString()
    questionText?: string;

    @ApiPropertyOptional({ example: "Optional longer description" })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ enum: alignment, example: "LEFT" })
    @IsOptional()
    @IsEnum(alignment)
    contentAlignment?: Alignment;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    isRequired?: boolean;

    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    @IsUUID()
    assessmentId: string;

    @ApiPropertyOptional({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    @IsOptional()
    @Transform(({ value }) => (value === "" || value === null ? undefined : value))
    @IsUUID()
    parentOptionId?: string;
}
