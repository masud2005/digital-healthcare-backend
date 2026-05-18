import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { categoryStatus } from "@constant/enums";
import type { CategoryStatus } from "@constant/enums";

export class CreateCategoryDto {
    @ApiProperty({ example: "Cardiology" })
    name: string;

    @ApiPropertyOptional({ example: "Heart and cardiovascular care" })
    description?: string;

    @ApiPropertyOptional({ enum: categoryStatus, example: "ACTIVE" })
    status?: CategoryStatus;
}
