import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export enum ConsultationTab {
    ACTIVE_CONSULTATION = "ACTIVE_CONSULTATION",
    NEW_REQUEST = "NEW_REQUEST",
    DECLINED_REQUEST = "DECLINED_REQUEST",
    HISTORY = "HISTORY",
}

export class DoctorConsultationItemDto {
    @ApiProperty({ example: "sub-uuid-1234" })
    id: string;

    @ApiProperty({ example: "Weight Loss" })
    category: string;

    @ApiProperty({ example: "Weight Loss" })
    title: string;

    @ApiProperty({ example: "Jenny Wilson" })
    patientName: string;

    @ApiPropertyOptional({ example: "https://...", nullable: true })
    thumbnail: string | null;

    @ApiProperty({ example: "ACCEPTED" })
    status: string;
}

export class DoctorConsultationListResponseDto {
    @ApiProperty({ type: [DoctorConsultationItemDto] })
    consultations: DoctorConsultationItemDto[];

    @ApiProperty({
        example: { ACTIVE_CONSULTATION: 5, NEW_REQUEST: 2, DECLINED_REQUEST: 1, HISTORY: 0 },
        description: "Count of consultations grouped by tab",
    })
    counts: Record<string, number>;
}

export class UpdateConsultationStatusDto {
    @ApiProperty({
        example: "ACCEPTED",
        enum: ["ACCEPTED", "REVIEWED", "REJECTED", "REFIL_REQUESTED"],
    })
    @IsString()
    @IsNotEmpty()
    status: string;

    @ApiPropertyOptional({
        example: "The patient is eligible for treatment.",
        description: "Mandatory if status is REJECTED or REFIL_REQUESTED",
    })
    @IsOptional()
    @IsString()
    doctorNotes?: string;
}
