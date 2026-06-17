import type { StateComplianceStatus } from "@constant/enums";
import { stateComplianceStatus } from "@constant/enums";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class StateCoverageQueryDto {
    @ApiPropertyOptional({ example: "California", description: "Search by state name or code" })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ enum: stateComplianceStatus, example: "COMPLIANT" })
    @IsOptional()
    @IsEnum(stateComplianceStatus)
    status?: StateComplianceStatus;

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
