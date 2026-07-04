import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateCoverageSectionDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;
}
