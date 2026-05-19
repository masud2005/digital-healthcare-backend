import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateQuestionOptionDto {
    @ApiProperty({ example: "Yes" })
    @IsString()
    @IsNotEmpty()
    label: string;

    @ApiPropertyOptional({ example: "Enter value" })
    @IsOptional()
    @IsString()
    placeholder?: string;

    @ApiPropertyOptional({ example: "text" })
    @IsOptional()
    @IsString()
    inputType?: string;

    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    @IsUUID()
    questionId: string;
}
