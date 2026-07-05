import { requestRecordType, requestRecordStatus } from "@constant/enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RequestRecordResponseDto {
    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    id: string;

    @ApiProperty({ example: "Alan" })
    firstName: string;

    @ApiProperty({ example: "Cottrell" })
    lastName: string;

    @ApiProperty({ example: "you@example.com" })
    email: string;

    @ApiProperty({ example: "1990-01-01T00:00:00.000Z" })
    dob: Date;

    @ApiProperty({ enum: requestRecordType, example: "MEDICAL_RECORDS" })
    requestType: string;

    @ApiPropertyOptional({
        example: "Any specific information about your request...",
        nullable: true,
    })
    additionalNotes: string | null;

    @ApiProperty({ example: true })
    consent: boolean;

    @ApiProperty({ enum: requestRecordStatus, example: "PENDING" })
    status: string;

    @ApiProperty({ example: "2026-06-11T08:30:00.000Z" })
    createdAt: Date;

    @ApiProperty({ example: "2026-06-11T08:30:00.000Z" })
    updatedAt: Date;
}

class RequestRecordListMetaDto {
    @ApiProperty({ example: 1 })
    page: number;

    @ApiProperty({ example: 10 })
    limit: number;

    @ApiProperty({ example: 7 })
    total: number;

    @ApiProperty({ example: 1 })
    totalPages: number;
}

export class RequestRecordListResponseDto {
    @ApiProperty({ type: [RequestRecordResponseDto] })
    data: RequestRecordResponseDto[];

    @ApiProperty({ type: RequestRecordListMetaDto })
    meta: RequestRecordListMetaDto;
}

class RequestRecordOverviewCountsDto {
    @ApiProperty({ example: 7 })
    total: number;

    @ApiProperty({ example: 4 })
    pending: number;

    @ApiProperty({ example: 2 })
    reviewed: number;

    @ApiProperty({ example: 1 })
    completed: number;
}

export class RequestRecordOverviewResponseDto {
    @ApiProperty({ type: RequestRecordOverviewCountsDto })
    counts: RequestRecordOverviewCountsDto;
}
