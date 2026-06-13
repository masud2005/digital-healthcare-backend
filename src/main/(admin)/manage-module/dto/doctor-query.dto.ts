import { ApiPropertyOptional } from "@nestjs/swagger";
import { userStatus } from "@constant/enums";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import type { UserStatus } from "@constant/enums";

export class DoctorQueryDto {
    @ApiPropertyOptional({
        example: "runa",
        description: "Search by name, email, or location",
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ enum: userStatus, example: "ACTIVE" })
    @IsOptional()
    @IsEnum(userStatus)
    status?: UserStatus;

    @ApiPropertyOptional({ example: "FNP-BC" })
    @IsOptional()
    @IsString()
    title?: string;

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
