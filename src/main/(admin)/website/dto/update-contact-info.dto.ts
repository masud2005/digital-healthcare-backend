import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateContactInfoDto {
    @ApiPropertyOptional({ example: "(720) 279-1104" })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({ example: "info@wlmmd.net" })
    @IsOptional()
    @IsString()
    email?: string;

    @ApiPropertyOptional({ example: "Mon - Fri: 9AM - 2PM" })
    @IsOptional()
    @IsString()
    openHours?: string;

    @ApiPropertyOptional({ example: "Sat - Sun" })
    @IsOptional()
    @IsString()
    closedDays?: string;
}
