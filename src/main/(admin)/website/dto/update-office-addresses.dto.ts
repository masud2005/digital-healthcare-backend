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

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
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
