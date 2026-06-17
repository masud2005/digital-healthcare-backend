import type { SideEffectSeverity, SideEffectStatus } from "@constant/enums";
import { sideEffectSeverity, sideEffectStatus } from "@constant/enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateSideEffectReportDto {
    @ApiProperty({ example: "Jessica" })
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({ example: "Martinez" })
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({ example: "jessica@example.com" })
    @IsString()
    @IsNotEmpty()
    email: string;

    @ApiPropertyOptional({ example: "(480) 555-0103" })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({ example: "b2dfc059-d890-4c12-92e1-456cb3c829e2" })
    @IsString()
    @IsNotEmpty()
    serviceId: string;

    @ApiProperty({ example: "c7823ab2-0d19-4781-a9f3-df461cf02a31" })
    @IsString()
    @IsNotEmpty()
    providerId: string;

    @ApiProperty({ enum: sideEffectSeverity, example: "MILD" })
    @IsEnum(sideEffectSeverity)
    severity: SideEffectSeverity;

    @ApiProperty({ example: "Mild nausea and tiredness during the day." })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiPropertyOptional({ enum: sideEffectStatus, example: "PENDING" })
    @IsOptional()
    @IsEnum(sideEffectStatus)
    status?: SideEffectStatus;

    @ApiPropertyOptional({ type: [String], example: [] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    attachmentIds?: string[];
}
