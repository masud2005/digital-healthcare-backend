import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class TestimonialQueryDto {
    @ApiPropertyOptional({ example: "john", description: "Search by client name or feedback" })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ example: true, type: Boolean })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    isPublished?: boolean;

    @ApiPropertyOptional({ example: 4, type: Number })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @Max(5)
    minRating?: number;

    @ApiPropertyOptional({ example: 5, type: Number })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @Max(5)
    maxRating?: number;

    @ApiPropertyOptional({ example: "2026-01-01T00:00:00.000Z" })
    @IsOptional()
    @IsString()
    fromDate?: string;

    @ApiPropertyOptional({ example: "2026-12-31T23:59:59.999Z" })
    @IsOptional()
    @IsString()
    toDate?: string;

    @ApiPropertyOptional({ example: 1, type: Number })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @ApiPropertyOptional({ example: 10, type: Number })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number;
}
