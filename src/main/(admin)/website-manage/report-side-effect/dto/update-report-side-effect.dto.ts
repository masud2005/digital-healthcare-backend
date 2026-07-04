import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator";

export class SymptomDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    text?: string;
}

export class EmergencyContactDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    contact?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    notes?: string;
}

export class EmergencyContactWidgetDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    sectionTitle?: string;

    @ApiPropertyOptional({ type: [EmergencyContactDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EmergencyContactDto)
    contacts?: EmergencyContactDto[];
}

export class UpdateReportSideEffectDto {
    @ApiPropertyOptional({ type: [SymptomDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SymptomDto)
    symptoms?: SymptomDto[];

    @ApiPropertyOptional({ type: EmergencyContactWidgetDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => EmergencyContactWidgetDto)
    emergencyWidget?: EmergencyContactWidgetDto;
}
