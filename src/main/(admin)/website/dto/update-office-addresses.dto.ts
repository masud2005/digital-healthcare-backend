import { ApiPropertyOptional, ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString } from "class-validator";

export class OfficeLocationDto {
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
