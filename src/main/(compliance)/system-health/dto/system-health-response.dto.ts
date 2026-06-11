import type { SystemHealthStatus } from "@constant/enums";
import { systemHealthStatus } from "@constant/enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class SystemHealthResponseDto {
    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    id: string;

    @ApiProperty({ example: "API Gateway" })
    name: string;

    @ApiPropertyOptional({ example: "Infrastructure", nullable: true })
    category: string | null;

    @ApiProperty({ enum: systemHealthStatus, example: "OPERATIONAL" })
    status: SystemHealthStatus;

    @ApiPropertyOptional({
        example: "Tracks API availability and response latency",
        nullable: true,
    })
    description: string | null;

    @ApiPropertyOptional({ example: "All services are responding normally", nullable: true })
    message: string | null;

    @ApiPropertyOptional({ example: 42, nullable: true })
    responseTimeMs: number | null;

    @ApiPropertyOptional({ example: 99.98, nullable: true })
    uptimePercent: number | null;

    @ApiProperty({ example: "2026-06-11T09:30:00.000Z" })
    checkedAt: Date;

    @ApiPropertyOptional({ example: "2026-06-11T10:15:00.000Z", nullable: true })
    resolvedAt: Date | null;

    @ApiPropertyOptional({ example: { region: "us-east-1", source: "monitoring" }, nullable: true })
    metadata: Record<string, unknown> | null;

    @ApiProperty({ example: true })
    isActive: boolean;

    @ApiProperty({ example: "2026-06-11T09:30:00.000Z" })
    createdAt: Date;

    @ApiProperty({ example: "2026-06-11T09:30:00.000Z" })
    updatedAt: Date;
}

class SystemHealthListMetaDto {
    @ApiProperty({ example: 1 })
    page: number;

    @ApiProperty({ example: 10 })
    limit: number;

    @ApiProperty({ example: 25 })
    total: number;

    @ApiProperty({ example: 3 })
    totalPages: number;
}

export class SystemHealthListResponseDto {
    @ApiProperty({ type: [SystemHealthResponseDto] })
    data: SystemHealthResponseDto[];

    @ApiProperty({ type: SystemHealthListMetaDto })
    meta: SystemHealthListMetaDto;
}

export class SystemHealthMetricResponseDto {
    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    id: string;

    @ApiProperty({ example: "Requests/min" })
    label: string;

    @ApiProperty({ example: "requests_per_minute" })
    key: string;

    @ApiProperty({ example: 1847 })
    value: number;

    @ApiPropertyOptional({ example: "%", nullable: true })
    unit: string | null;

    @ApiPropertyOptional({ example: "1,847", nullable: true })
    displayValue: string | null;

    @ApiProperty({ example: "2026-06-11T09:30:00.000Z" })
    recordedAt: Date;

    @ApiPropertyOptional({ example: { source: "monitoring" }, nullable: true })
    metadata: Record<string, unknown> | null;

    @ApiProperty({ example: true })
    isActive: boolean;

    @ApiProperty({ example: "2026-06-11T09:30:00.000Z" })
    createdAt: Date;

    @ApiProperty({ example: "2026-06-11T09:30:00.000Z" })
    updatedAt: Date;
}

export class SystemHealthMetricListResponseDto {
    @ApiProperty({ type: [SystemHealthMetricResponseDto] })
    data: SystemHealthMetricResponseDto[];

    @ApiProperty({ type: SystemHealthListMetaDto })
    meta: SystemHealthListMetaDto;
}

class SystemHealthSummaryCountsDto {
    @ApiProperty({ example: 6 })
    total: number;

    @ApiProperty({ example: 5 })
    operational: number;

    @ApiProperty({ example: 2 })
    degraded: number;

    @ApiProperty({ example: 0 })
    down: number;

    @ApiProperty({ example: 0 })
    maintenance: number;
}

export class SystemHealthSummaryResponseDto {
    @ApiProperty({ example: "Some Services Degraded" })
    title: string;

    @ApiProperty({ type: SystemHealthSummaryCountsDto })
    counts: SystemHealthSummaryCountsDto;

    @ApiProperty({ type: [SystemHealthResponseDto] })
    services: SystemHealthResponseDto[];

    @ApiProperty({ type: [SystemHealthMetricResponseDto] })
    metrics: SystemHealthMetricResponseDto[];
}
