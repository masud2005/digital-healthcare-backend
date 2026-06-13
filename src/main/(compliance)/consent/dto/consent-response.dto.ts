import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ConsentType, ConsentStatus, ConsentSource } from "@prisma/client";

export class ConsentResponseDto {
    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    id: string;

    @ApiPropertyOptional({ example: "Jessica Martinez", nullable: true })
    userName: string | null;

    @ApiPropertyOptional({ example: "jessica.m@email.com", nullable: true })
    email: string | null;

    @ApiProperty({ example: "DATA_PROCESSING", enum: ["DATA_PROCESSING", "MARKETING", "ANALYTICS", "AI_TRAINING"] })
    type: ConsentType;

    @ApiProperty({ example: "ACCEPTED", enum: ["ACCEPTED", "REVOKED", "PENDING"] })
    status: ConsentStatus;

    @ApiProperty({ example: "WEB", enum: ["WEB", "MOBILE"] })
    source: ConsentSource;

    @ApiPropertyOptional({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f", nullable: true })
    userId: string | null;

    @ApiProperty({ example: "2026-05-18T04:00:00.000Z" })
    consentDate: Date;

    @ApiProperty({ example: "2026-05-18T04:00:00.000Z" })
    createdAt: Date;

    @ApiProperty({ example: "2026-05-18T04:00:00.000Z" })
    updatedAt: Date;
}

export class ConsentStatsResponseDto {
    @ApiProperty({ example: 2847 })
    total: number;

    @ApiProperty({ example: 2112 })
    granted: number;

    @ApiProperty({ example: 493 })
    pending: number;

    @ApiProperty({ example: 242 })
    revoked: number;
}

class ConsentListMetaDto {
    @ApiProperty({ example: 1 })
    page: number;

    @ApiProperty({ example: 10 })
    limit: number;

    @ApiProperty({ example: 25 })
    total: number;

    @ApiProperty({ example: 3 })
    totalPages: number;
}

export class ConsentListResponseDto {
    @ApiProperty({ type: [ConsentResponseDto] })
    data: ConsentResponseDto[];

    @ApiProperty({ type: ConsentListMetaDto })
    meta: ConsentListMetaDto;
}
