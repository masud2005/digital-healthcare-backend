import type { RequestRecordType, RequestRecordStatus } from "@constant/enums";
import { requestRecordType, requestRecordStatus } from "@constant/enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateRequestRecordDto {
    @ApiProperty({ example: "Alan" })
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({ example: "Cottrell" })
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({ example: "you@example.com" })
    @IsString()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: "1990-01-01T00:00:00.000Z" })
    @IsString()
    @IsNotEmpty()
    dob: string;

    @ApiProperty({ enum: requestRecordType, example: "MEDICAL_RECORDS" })
    @IsEnum(requestRecordType)
    requestType: RequestRecordType;

    @ApiPropertyOptional({ example: "Any specific information about your request..." })
    @IsOptional()
    @IsString()
    additionalNotes?: string;

    @ApiProperty({ example: true })
    @IsBoolean()
    consent: boolean;

    @ApiPropertyOptional({ enum: requestRecordStatus, example: "PENDING" })
    @IsOptional()
    @IsEnum(requestRecordStatus)
    status?: RequestRecordStatus;
}
