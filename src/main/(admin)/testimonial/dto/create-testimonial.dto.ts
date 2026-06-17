import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateTestimonialDto {
    @ApiProperty({ example: "John Doe" })
    @IsString()
    @IsNotEmpty()
    clientName: string;

    @ApiPropertyOptional({ example: "The care team was excellent." })
    @IsOptional()
    @IsString()
    feedback?: string;

    @ApiProperty({ example: 5, type: Number })
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @Max(5)
    rating: number;

    @ApiProperty({ example: "2026-06-08T00:00:00.000Z" })
    @Type(() => Date)
    @IsDate()
    date: Date;

    @ApiPropertyOptional({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    @IsOptional()
    @IsString()
    avatarId?: string;
}
