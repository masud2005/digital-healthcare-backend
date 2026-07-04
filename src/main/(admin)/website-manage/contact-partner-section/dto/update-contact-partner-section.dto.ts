import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString } from "class-validator";

export class UpdateContactPartnerSectionDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    sectionTitle?: string;

    @ApiPropertyOptional({
        type: [String],
        description: "Array of attachment IDs for partner logos",
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    imageIds?: string[];
}
