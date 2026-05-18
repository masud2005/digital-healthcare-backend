import { ApiPropertyOptional } from "@nestjs/swagger";
import { categoryStatus } from "@constant/enums";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import type { CategoryStatus } from "@constant/enums";

export class UpdateCategoryDto {
    @ApiPropertyOptional({ example: "Cardiology" })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @ApiPropertyOptional({ example: "Heart and cardiovascular care" })
    @IsOptional()
    @IsString()
    description?: string | null;

    @ApiPropertyOptional({ enum: categoryStatus, example: "ACTIVE" })
    @IsOptional()
    @IsEnum(categoryStatus)
    status?: CategoryStatus;
}
