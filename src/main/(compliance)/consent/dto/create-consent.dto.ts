import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ConsentType, ConsentStatus, ConsentSource } from "@prisma/client";

export class CreateConsentDto {
    @ApiPropertyOptional({ example: "Jessica Martinez" })
    @IsOptional()
    @IsString()
    userName?: string;

    @ApiPropertyOptional({ example: "jessica.m@email.com" })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({ example: "DATA_PROCESSING", enum: ["DATA_PROCESSING", "MARKETING", "ANALYTICS", "AI_TRAINING"] })
    @IsEnum(["DATA_PROCESSING", "MARKETING", "ANALYTICS", "AI_TRAINING"])
    @IsNotEmpty()
    type: ConsentType;

    @ApiPropertyOptional({ example: "ACCEPTED", enum: ["ACCEPTED", "REVOKED", "PENDING"] })
    @IsOptional()
    @IsEnum(["ACCEPTED", "REVOKED", "PENDING"])
    status?: ConsentStatus;

    @ApiPropertyOptional({ example: "WEB", enum: ["WEB", "MOBILE"] })
    @IsOptional()
    @IsEnum(["WEB", "MOBILE"])
    source?: ConsentSource;
}
