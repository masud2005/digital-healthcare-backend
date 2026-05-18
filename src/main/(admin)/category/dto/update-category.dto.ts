import { ApiPropertyOptional } from "@nestjs/swagger";
import { categoryStatus } from "@constant/enums";
import type { CategoryStatus } from "@constant/enums";

export class UpdateCategoryDto {
    @ApiPropertyOptional({ example: "Cardiology" })
    name?: string;

    @ApiPropertyOptional({ example: "Heart and cardiovascular care" })
    description?: string | null;

    @ApiPropertyOptional({ enum: categoryStatus, example: "ACTIVE" })
    status?: CategoryStatus;
}
