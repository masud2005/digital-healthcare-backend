import type { ProviderLicenseSource, ProviderLicenseStatus } from "@constant/enums";
import { providerLicenseSource, providerLicenseStatus } from "@constant/enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
    IsArray,
    IsBoolean,
    IsDate,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
} from "class-validator";

export class CreateProviderLicenseDto {
    @ApiPropertyOptional({
        example: "uuid-doctor-id",
        description: "Optional link to a DoctorProfile",
    })
    @IsOptional()
    @IsString()
    doctorId?: string;

    @ApiProperty({ example: "Dr. Sarah Mitchell" })
    @IsString()
    @IsNotEmpty()
    doctorName: string;

    @ApiPropertyOptional({ example: "dr.mitchell@weightlossmd.com" })
    @IsOptional()
    @IsEmail()
    doctorEmail?: string;

    @ApiPropertyOptional({ example: "#4f46e5", description: "Avatar background color for UI" })
    @IsOptional()
    @IsString()
    avatarColor?: string;

    @ApiPropertyOptional({ example: "1234567890" })
    @IsOptional()
    @IsString()
    npiNumber?: string;

    @ApiPropertyOptional({ example: "BM1234567" })
    @IsOptional()
    @IsString()
    deaNumber?: string;

    @ApiPropertyOptional({ example: "LIC-98765" })
    @IsOptional()
    @IsString()
    licenseNumber?: string;

    @ApiPropertyOptional({ example: "MD", description: "License type: MD, NP, PA, DO, etc." })
    @IsOptional()
    @IsString()
    licenseType?: string;

    @ApiPropertyOptional({
        example: ["TX", "CA", "FL"],
        type: [String],
        description: "States where the provider is licensed",
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    licenseStates?: string[];

    @ApiPropertyOptional({ enum: providerLicenseSource, example: "PRIMARY" })
    @IsOptional()
    @IsEnum(providerLicenseSource)
    licenseSource?: ProviderLicenseSource;

    @ApiPropertyOptional({ enum: providerLicenseStatus, example: "ACTIVE" })
    @IsOptional()
    @IsEnum(providerLicenseStatus)
    licenseStatus?: ProviderLicenseStatus;

    @ApiPropertyOptional({ example: "2027-06-01T00:00:00.000Z" })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    licenseExpiresAt?: Date;

    @ApiPropertyOptional({ example: "BlueCross BlueShield" })
    @IsOptional()
    @IsString()
    insuranceProvider?: string;

    @ApiPropertyOptional({ enum: providerLicenseStatus, example: "ACTIVE" })
    @IsOptional()
    @IsEnum(providerLicenseStatus)
    insuranceStatus?: ProviderLicenseStatus;

    @ApiPropertyOptional({ example: "2026-12-01T00:00:00.000Z" })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    insuranceExpiresAt?: Date;

    @ApiPropertyOptional({ example: "Verified via NPPES" })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    isActive?: boolean;
}
