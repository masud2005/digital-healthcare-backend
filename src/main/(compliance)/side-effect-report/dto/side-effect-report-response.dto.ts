import { sideEffectSeverity, sideEffectStatus } from "@constant/enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AttachmentResponseDto } from "@global/attachment/dto/attachment-response.dto";

class CategoryMinResponseDto {
    @ApiProperty({ example: "b2dfc059-d890-4c12-92e1-456cb3c829e2" })
    id: string;

    @ApiProperty({ example: "Semaglutide" })
    name: string;
}

class DoctorProfileMinResponseDto {
    @ApiProperty({ example: "c7823ab2-0d19-4781-a9f3-df461cf02a31" })
    id: string;

    @ApiProperty({ example: "Dr. Runa Pradhan" })
    name: string;
}

export class SideEffectReportResponseDto {
    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    id: string;

    @ApiProperty({ example: "Jessica" })
    firstName: string;

    @ApiProperty({ example: "Martinez" })
    lastName: string;

    @ApiProperty({ example: "jessica@example.com" })
    email: string;

    @ApiPropertyOptional({ example: "(480) 555-0103", nullable: true })
    phone: string | null;

    @ApiProperty({ enum: sideEffectSeverity, example: "MILD" })
    severity: string;

    @ApiProperty({ enum: sideEffectStatus, example: "PENDING" })
    status: string;

    @ApiProperty({ example: "Mild nausea and tiredness during the day." })
    description: string;

    @ApiProperty({ example: "b2dfc059-d890-4c12-92e1-456cb3c829e2" })
    serviceId: string;

    @ApiProperty({ type: () => CategoryMinResponseDto })
    service: CategoryMinResponseDto;

    @ApiProperty({ example: "c7823ab2-0d19-4781-a9f3-df461cf02a31" })
    providerId: string;

    @ApiProperty({ type: () => DoctorProfileMinResponseDto })
    provider: DoctorProfileMinResponseDto;

    @ApiProperty({ type: [AttachmentResponseDto] })
    attachments: AttachmentResponseDto[];

    @ApiProperty({ example: "2026-06-11T08:30:00.000Z" })
    createdAt: Date;

    @ApiProperty({ example: "2026-06-11T08:30:00.000Z" })
    updatedAt: Date;
}

class SideEffectReportListMetaDto {
    @ApiProperty({ example: 1 })
    page: number;

    @ApiProperty({ example: 10 })
    limit: number;

    @ApiProperty({ example: 7 })
    total: number;

    @ApiProperty({ example: 1 })
    totalPages: number;
}

export class SideEffectReportListResponseDto {
    @ApiProperty({ type: [SideEffectReportResponseDto] })
    data: SideEffectReportResponseDto[];

    @ApiProperty({ type: SideEffectReportListMetaDto })
    meta: SideEffectReportListMetaDto;
}

class SideEffectReportOverviewCountsDto {
    @ApiProperty({ example: 7 })
    total: number;

    @ApiProperty({ example: 4 })
    pending: number;

    @ApiProperty({ example: 2 })
    lifeThreatening: number;

    @ApiProperty({ example: 4 })
    withAttachments: number;
}

export class SideEffectReportOverviewResponseDto {
    @ApiProperty({ type: SideEffectReportOverviewCountsDto })
    counts: SideEffectReportOverviewCountsDto;
}
