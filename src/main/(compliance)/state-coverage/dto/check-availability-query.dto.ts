import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsArray, IsOptional, IsString } from "class-validator";

export class CheckAvailabilityQueryDto {
    @ApiPropertyOptional({
        example: "b2dfc059-d890-4c12-92e1-456cb3c829e2",
        description: "Filter by category id (allowed service)",
    })
    @IsOptional()
    @IsString()
    categoryId?: string;

    @ApiPropertyOptional({
        example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f",
        description: "Filter by state coverage id. Returns only that state.",
    })
    @IsOptional()
    @IsString()
    stateId?: string;
}
