import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsInt, Min, IsDateString } from "class-validator";
import { Transform } from "class-transformer";

export class AuditLogQueryDto {
    @ApiPropertyOptional({ description: "Search query for user, event, or IP" })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: "Filter by user role" })
    @IsOptional()
    @IsString()
    role?: string;

    @ApiPropertyOptional({ description: "Filter by activity type" })
    @IsOptional()
    @IsString()
    activityType?: string;

    @ApiPropertyOptional({ description: "Filter by status (SUCCESS or FAILED)" })
    @IsOptional()
    @IsString()
    status?: string;

    @ApiPropertyOptional({ description: "Filter by start date" })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional({ description: "Filter by end date" })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiPropertyOptional({ default: 1 })
    @IsOptional()
    @Transform(({ value }) => parseInt(value, 10))
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ default: 10 })
    @IsOptional()
    @Transform(({ value }) => parseInt(value, 10))
    @IsInt()
    @Min(1)
    limit?: number = 10;
}
