import { ApiPropertyOptional, ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsArray, IsBoolean, IsOptional, IsString, ValidateNested } from "class-validator";

export class OfficeLocationDto {
    @ApiPropertyOptional({ example: "clh1234567890123456789012" })
    @IsOptional()
    @IsString()
    id?: string;

    @ApiProperty({ example: "Colorado Springs" })
    @IsString()
    name: string;

    @ApiProperty({ example: "1625 Medical Center Point, Suite 120" })
    @IsString()
    address: string;

    @ApiPropertyOptional({ example: "Colorado Springs" })
    @IsOptional()
    @IsString()
    city?: string;

    @ApiPropertyOptional({ example: "CO" })
    @IsOptional()
    @IsString()
    state?: string;

    @ApiPropertyOptional({ example: "80907" })
    @IsOptional()
    @IsString()
    zipCode?: string;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({ example: "https://facebook.com/office" })
    @IsOptional()
    @IsString()
    facebookUrl?: string;

    @ApiPropertyOptional({ example: "https://instagram.com/office" })
    @IsOptional()
    @IsString()
    instagramUrl?: string;

    @ApiPropertyOptional({ example: "https://twitter.com/office" })
    @IsOptional()
    @IsString()
    twitterUrl?: string;

    @ApiPropertyOptional({ example: "https://linkedin.com/office" })
    @IsOptional()
    @IsString()
    linkedinUrl?: string;
}

export class UpdateOfficeAddressesDto {
    @ApiPropertyOptional({ type: [OfficeLocationDto] })
    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === "string") {
            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        }
        return value;
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OfficeLocationDto)
    offices?: OfficeLocationDto[];
}
