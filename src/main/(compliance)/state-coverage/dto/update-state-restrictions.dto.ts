import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsOptional, IsString } from "class-validator";

export class UpdateStateRestrictionsDto {
    @ApiPropertyOptional({ type: [String], example: [] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    allowedCategoryIds?: string[];

    @ApiPropertyOptional({ example: false })
    @IsOptional()
    @IsBoolean()
    isComingSoon?: boolean;
}
