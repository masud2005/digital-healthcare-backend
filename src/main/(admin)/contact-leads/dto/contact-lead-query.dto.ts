import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class ContactLeadQueryDto {
    @ApiPropertyOptional({
        example: "john",
        description: "Search by full name, email, phone, service, or message",
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ example: "Medical Weight Loss" })
    @IsOptional()
    @IsString()
    service?: string;

    @ApiPropertyOptional({ example: false, type: Boolean })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    read?: boolean;

    @ApiPropertyOptional({ example: false, type: Boolean })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    responded?: boolean;

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
