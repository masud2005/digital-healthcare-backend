import { providerLicenseSource, providerLicenseStatus } from "@constant/enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ProviderLicenseResponseDto {
    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    id: string;

    @ApiPropertyOptional({ example: "uuid-doctor-id", nullable: true })
    doctorId: string | null;

    @ApiProperty({ example: "Dr. Sarah Mitchell" })
    doctorName: string;

    @ApiPropertyOptional({ example: "dr.mitchell@weightlossmd.com", nullable: true })
    doctorEmail: string | null;

    @ApiPropertyOptional({ example: "#4f46e5", nullable: true })
    avatarColor: string | null;

    @ApiPropertyOptional({ example: "1234567890", nullable: true })
    npiNumber: string | null;

    @ApiPropertyOptional({ example: "BM1234567", nullable: true })
    deaNumber: string | null;

    @ApiPropertyOptional({ example: "LIC-98765", nullable: true })
    licenseNumber: string | null;

    @ApiPropertyOptional({ example: "MD", nullable: true })
    licenseType: string | null;

    @ApiPropertyOptional({ example: ["TX", "CA", "FL"], nullable: true })
    licenseStates: string[] | null;

    @ApiProperty({ enum: providerLicenseSource, example: "PRIMARY" })
    licenseSource: string;

    @ApiProperty({ enum: providerLicenseStatus, example: "ACTIVE" })
    licenseStatus: string;

    @ApiPropertyOptional({ example: "2027-06-01T00:00:00.000Z", nullable: true })
    licenseExpiresAt: Date | null;

    @ApiPropertyOptional({ example: "BlueCross BlueShield", nullable: true })
    insuranceProvider: string | null;

    @ApiProperty({ enum: providerLicenseStatus, example: "ACTIVE" })
    insuranceStatus: string;

    @ApiPropertyOptional({ example: "2026-12-01T00:00:00.000Z", nullable: true })
    insuranceExpiresAt: Date | null;

    @ApiPropertyOptional({ example: "Verified via NPPES", nullable: true })
    notes: string | null;

    @ApiProperty({ example: true })
    isActive: boolean;

    @ApiProperty({ example: "2026-06-01T00:00:00.000Z" })
    createdAt: Date;

    @ApiProperty({ example: "2026-06-01T00:00:00.000Z" })
    updatedAt: Date;
}

class ProviderLicenseListMetaDto {
    @ApiProperty({ example: 1 })
    page: number;

    @ApiProperty({ example: 10 })
    limit: number;

    @ApiProperty({ example: 42 })
    total: number;

    @ApiProperty({ example: 5 })
    totalPages: number;
}

export class ProviderLicenseListResponseDto {
    @ApiProperty({ type: [ProviderLicenseResponseDto] })
    data: ProviderLicenseResponseDto[];

    @ApiProperty({ type: ProviderLicenseListMetaDto })
    meta: ProviderLicenseListMetaDto;
}

export class ProviderLicenseStatsResponseDto {
    @ApiProperty({ example: 42 })
    total: number;

    @ApiProperty({ example: 35 })
    active: number;

    @ApiProperty({ example: 5 })
    expiringSoon: number;

    @ApiProperty({ example: 2 })
    expired: number;

    @ApiProperty({ example: 0 })
    pending: number;

    @ApiProperty({ example: 3, description: "Licenses expiring within 30 days" })
    expiringIn30Days: number;

    @ApiProperty({ example: 7, description: "Licenses expiring within 90 days" })
    expiringIn90Days: number;

    @ApiProperty({ example: 4, description: "Insurance policies expiring within 30 days" })
    insuranceExpiringIn30Days: number;

    @ApiProperty({ example: 9, description: "Insurance policies expiring within 90 days" })
    insuranceExpiringIn90Days: number;
}
