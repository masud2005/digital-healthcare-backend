import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
    IsBoolean,
    IsDate,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    Min,
} from "class-validator";

export class UpdateTestimonialDto {
    @ApiPropertyOptional({ example: "John Doe" })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    clientName?: string;

    @ApiPropertyOptional({ example: "The care team was excellent.", nullable: true })
    @IsOptional()
    @IsString()
    feedback?: string | null;

    @ApiPropertyOptional({ example: 5, type: Number })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @Max(5)
    rating?: number;

    @ApiPropertyOptional({ example: "2026-06-08T00:00:00.000Z" })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    date?: Date;

    @ApiPropertyOptional({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f", nullable: true })
    @IsOptional()
    @IsString()
    avatarId?: string | null;

    @ApiPropertyOptional({ example: true, type: Boolean })
    @IsOptional()
    @IsBoolean()
    isPublished?: boolean;
}
