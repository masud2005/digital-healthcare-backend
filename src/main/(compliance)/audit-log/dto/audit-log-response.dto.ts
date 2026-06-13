import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AuditLogItemResponseDto {
    @ApiProperty()
    id: string;

    @ApiPropertyOptional({ nullable: true })
    userId: string | null;

    @ApiProperty()
    userName: string;

    @ApiProperty()
    userRole: string;

    @ApiProperty()
    activityType: string;

    @ApiProperty()
    event: string;

    @ApiPropertyOptional({ nullable: true })
    ipAddress: string | null;

    @ApiPropertyOptional({ nullable: true })
    sessionDue: string | null;

    @ApiPropertyOptional({ nullable: true })
    fileUrl: string | null;

    @ApiProperty()
    status: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}

export class AuditLogStatsResponseDto {
    @ApiProperty({ example: 3847 })
    totalActivities: number;

    @ApiProperty({ example: 12 })
    activitiesChangePercent: number;

    @ApiProperty({ example: 24 })
    failedLogins: number;

    @ApiProperty({ example: 3 })
    failedLoginsChangeThisHour: number;

    @ApiProperty({ example: 142 })
    activeSessions: number;

    @ApiProperty({ example: 8 })
    dataExports: number;
}

export class AuditLogListResponseDto {
    @ApiProperty({ type: [AuditLogItemResponseDto] })
    data: AuditLogItemResponseDto[];

    @ApiProperty({ example: 158 })
    total: number;

    @ApiProperty({ example: 1 })
    page: number;

    @ApiProperty({ example: 10 })
    limit: number;
}

export class AuditLogExportQueryDto {
    search?: string;
    role?: string;
    activityType?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
}
