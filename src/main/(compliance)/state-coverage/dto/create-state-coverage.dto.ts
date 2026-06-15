import type { StateComplianceStatus } from "@constant/enums";
import { stateComplianceStatus } from "@constant/enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateStateCoverageDto {
    @ApiProperty({ example: "CA" })
    @IsString()
    @IsNotEmpty()
    stateCode: string;

    @ApiProperty({ example: "California" })
    @IsString()
    @IsNotEmpty()
    stateName: string;

    @ApiPropertyOptional({ enum: stateComplianceStatus, example: "COMPLIANT" })
    @IsOptional()
    @IsEnum(stateComplianceStatus)
    status?: StateComplianceStatus;

    @ApiPropertyOptional({ example: false })
    @IsOptional()
    @IsBoolean()
    isComingSoon?: boolean;

    @ApiPropertyOptional({ type: [String], example: [] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    allowedCategoryIds?: string[];
}
