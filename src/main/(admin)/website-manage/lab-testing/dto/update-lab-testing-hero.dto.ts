import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString } from "class-validator";

export class UpdateLabTestingHeroDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    buttonText?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    buttonUrl?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isBlank?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    imageId?: string;
}
