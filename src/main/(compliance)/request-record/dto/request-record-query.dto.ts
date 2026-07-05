import type { RequestRecordType, RequestRecordStatus } from "@constant/enums";
import { requestRecordType, requestRecordStatus } from "@constant/enums";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class RequestRecordQueryDto {
    @ApiPropertyOptional({
        example: "Alan",
        description: "Search by name, email, or additional notes",
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ enum: requestRecordType, example: "MEDICAL_RECORDS" })
    @IsOptional()
    @IsEnum(requestRecordType)
    requestType?: RequestRecordType;

    @ApiPropertyOptional({ enum: requestRecordStatus, example: "PENDING" })
    @IsOptional()
    @IsEnum(requestRecordStatus)
    status?: RequestRecordStatus;

    @ApiPropertyOptional({ example: "2026-06-01T00:00:00.000Z" })
    @IsOptional()
    @IsString()
    from?: string;

    @ApiPropertyOptional({ example: "2026-06-30T23:59:59.999Z" })
    @IsOptional()
    @IsString()
    to?: string;

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
