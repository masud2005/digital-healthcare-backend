import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { userStatus } from "@constant/enums";
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import type { UserStatus } from "@constant/enums";

export class CreateDoctorDto {
    @ApiProperty({
        type: "string",
        format: "binary",
        description: "Doctor thumbnail",
    })
    @IsOptional()
    thumbnail?: any;

    @ApiProperty({ example: "Dr. Runa Pradhan NP" })
    @IsString()
    @IsNotEmpty()
    fullName: string;

    @ApiPropertyOptional({ example: "Licensed Colorado-Nurse Practitioner - Family" })
    @IsOptional()
    @IsString()
    shortBio?: string;

    @ApiProperty({ example: "runa.pradhannp@gmail.com" })
    @IsEmail()
    email: string;

    @ApiProperty({ example: "StrongPass123!" })
    @IsString()
    @MinLength(8)
    password: string;

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
