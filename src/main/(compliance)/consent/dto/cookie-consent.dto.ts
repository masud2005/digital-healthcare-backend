import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsOptional } from "class-validator";
import { ConsentSource } from "@prisma/client";

export class CookieConsentDto {
    @ApiProperty({ example: true })
    @IsBoolean()
    analytics: boolean;

    @ApiProperty({ example: true })
    @IsBoolean()
    marketing: boolean;

    @ApiPropertyOptional({ example: "WEB", enum: ["WEB", "MOBILE"] })
    @IsOptional()
    @IsEnum(["WEB", "MOBILE"])
    source?: ConsentSource;
}
