import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { userStatus } from "@constant/enums";
import {
    IsBoolean,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    MinLength,
} from "class-validator";
import type { UserStatus } from "@constant/enums";

export class CreateDoctorDto {
    @ApiPropertyOptional({
        example: "a1b2c3d4-...",
        description: "Attachment ID from POST /attachments/upload with context DOCTOR_AVATAR",
    })
    @IsOptional()
    @IsUUID()
    avatarId?: string;

    @ApiPropertyOptional({ example: true, description: "Whether the doctor is featured" })
    @IsOptional()
    @IsBoolean()
    featured?: boolean;

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
