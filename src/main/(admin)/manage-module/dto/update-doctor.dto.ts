import { ApiPropertyOptional } from "@nestjs/swagger";
import { userStatus } from "@constant/enums";
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import type { UserStatus } from "@constant/enums";

export class UpdateDoctorDto {
    @ApiPropertyOptional({
        type: "string",
        format: "binary",
        description: "Doctor thumbnail",
    })
    @IsOptional()
    thumbnail?: any;

    @ApiPropertyOptional({ example: "Dr. Runa Pradhan NP" })
    @IsOptional()
    @IsString()
    fullName?: string;

    @ApiPropertyOptional({ example: "Licensed Colorado-Nurse Practitioner - Family" })
    @IsOptional()
    @IsString()
    shortBio?: string;

    @ApiPropertyOptional({ example: "runa.pradhannp@gmail.com" })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({ example: "StrongPass123!" })
    @IsOptional()
    @IsString()
    @MinLength(8)
    password?: string;

    @ApiPropertyOptional({ enum: userStatus, example: "ACTIVE" })
    @IsOptional()
    @IsEnum(userStatus)
    status?: UserStatus;

    @ApiPropertyOptional({ example: "FNP-BC" })
    @IsOptional()
    @IsString()
    roleTitle?: string;

    @ApiPropertyOptional({ example: "Colorado Springs" })
    @IsOptional()
    @IsString()
    officeLocation?: string;
}
