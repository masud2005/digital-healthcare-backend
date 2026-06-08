import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

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
}
