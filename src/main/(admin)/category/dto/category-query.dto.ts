import { ApiPropertyOptional } from "@nestjs/swagger";
import { categoryStatus } from "@constant/enums";
import type { CategoryStatus } from "@constant/enums";

export class CategoryQueryDto {
    @ApiPropertyOptional({ example: "cardio", description: "Search by name or description" })
    search?: string;

    @ApiPropertyOptional({ enum: categoryStatus, example: "ACTIVE" })
    status?: CategoryStatus;

    @ApiPropertyOptional({ example: 1, type: Number })
    page?: string;

    @ApiPropertyOptional({ example: 10, type: Number })
    limit?: string;
}
