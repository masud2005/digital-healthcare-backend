import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsInt, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";
import { ConsentType, ConsentStatus, ConsentSource } from "@prisma/client";

export class ConsentQueryDto {
    @ApiPropertyOptional({ example: "Jessica" })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ example: "PATIENT" })
    @IsOptional()
    @IsString()
    role?: string;

    @ApiPropertyOptional({
        example: "DATA_PROCESSING",
        enum: ["DATA_PROCESSING", "MARKETING", "ANALYTICS", "AI_TRAINING"],
    })
    @IsOptional()
    @IsEnum(["DATA_PROCESSING", "MARKETING", "ANALYTICS", "AI_TRAINING"])
    type?: ConsentType;

    @ApiPropertyOptional({ example: "ACCEPTED", enum: ["ACCEPTED", "REVOKED", "PENDING"] })
    @IsOptional()
    @IsEnum(["ACCEPTED", "REVOKED", "PENDING"])
    status?: ConsentStatus;

    @ApiPropertyOptional({ example: "WEB", enum: ["WEB", "MOBILE"] })
    @IsOptional()
    @IsEnum(["WEB", "MOBILE"])
    source?: ConsentSource;

    @ApiPropertyOptional({ example: "2026-06-01" })
    @IsOptional()
    @IsString()
    startDate?: string;

    @ApiPropertyOptional({ example: "2026-06-30" })
    @IsOptional()
    @IsString()
    endDate?: string;

    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    page?: number;

    @ApiPropertyOptional({ example: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    limit?: number;
}
