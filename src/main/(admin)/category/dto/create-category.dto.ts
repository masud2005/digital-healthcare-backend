import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { categoryStatus } from "@constant/enums";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import type { CategoryStatus } from "@constant/enums";

export class CreateCategoryDto {
    @ApiProperty({ example: "Cardiology" })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ example: "Heart and cardiovascular care" })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ enum: categoryStatus, example: "ACTIVE" })
    @IsOptional()
    @IsEnum(categoryStatus)
    status?: CategoryStatus;
}
