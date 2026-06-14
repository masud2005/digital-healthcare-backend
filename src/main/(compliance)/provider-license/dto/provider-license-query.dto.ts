import type { ProviderLicenseSource, ProviderLicenseStatus } from "@constant/enums";
import { providerLicenseSource, providerLicenseStatus } from "@constant/enums";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class ProviderLicenseQueryDto {
    @ApiPropertyOptional({
        description: "Search by doctor name, email, NPI, DEA or license number",
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ enum: providerLicenseStatus })
    @IsOptional()
    @IsEnum(providerLicenseStatus)
    licenseStatus?: ProviderLicenseStatus;

    @ApiPropertyOptional({ enum: providerLicenseStatus })
    @IsOptional()
    @IsEnum(providerLicenseStatus)
    insuranceStatus?: ProviderLicenseStatus;

    @ApiPropertyOptional({ enum: providerLicenseSource })
    @IsOptional()
    @IsEnum(providerLicenseSource)
    licenseSource?: ProviderLicenseSource;

    @ApiPropertyOptional({ description: "Filter by state abbreviation (e.g. TX, CA)" })
    @IsOptional()
    @IsString()
    licenseState?: string;

    @ApiPropertyOptional({ description: "Filter by license type (MD, NP, PA, etc.)" })
    @IsOptional()
    @IsString()
    licenseType?: string;

    @ApiPropertyOptional({
        description: "ISO date string — filter licenses expiring on or after this date",
    })
    @IsOptional()
    @IsString()
    expiresFrom?: string;

    @ApiPropertyOptional({
        description: "ISO date string — filter licenses expiring on or before this date",
    })
    @IsOptional()
    @IsString()
    expiresTo?: string;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({ example: 1, minimum: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 100 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number;
}
