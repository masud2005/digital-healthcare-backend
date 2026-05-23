import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class UpdateQuestionOptionDto {
    @ApiPropertyOptional({ example: "Yes" })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    label?: string;

    @ApiPropertyOptional({ example: "Enter value" })
    @IsOptional()
    @IsString()
    placeholder?: string;

    @ApiPropertyOptional({ example: "text" })
    @IsOptional()
    @IsString()
    inputType?: string;

    @ApiPropertyOptional({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    @IsOptional()
    @IsUUID()
    questionId?: string;
}
