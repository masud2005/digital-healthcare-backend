import { Controller, Get, Query, Res, Body, Post, Req } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiProduces, ApiQuery, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import { AuditLogService } from "./audit-log.service";
import { AuditLogQueryDto } from "./dto/audit-log-query.dto";
import { AuditLogListResponseDto, AuditLogStatsResponseDto } from "./dto/audit-log-response.dto";

@ApiTags("(Compliance) Audit Logs")
@Controller("compliance/audit-logs")
export class AuditLogController {
    constructor(private readonly auditLogService: AuditLogService) {}

    @Get("stats")
    @ApiOperation({ summary: "Get audit log dashboard stats" })
    @ApiOkResponse({ type: AuditLogStatsResponseDto })
    getStats() {
        return this.auditLogService.getStats();
    }

    @Get()
    @ApiOperation({ summary: "List audit logs with filtering and pagination" })
    @ApiOkResponse({ type: AuditLogListResponseDto })
    listLogs(@Query() query: AuditLogQueryDto) {
        return this.auditLogService.listLogs(query);
    }

    @Get("export")
    @ApiOperation({ summary: "Export audit logs as CSV" })
    @ApiProduces("text/csv")
    @ApiQuery({ name: "search", required: false })
    @ApiQuery({ name: "role", required: false })
    @ApiQuery({ name: "activityType", required: false })
    @ApiQuery({ name: "status", required: false })
    @ApiQuery({ name: "startDate", required: false })
    @ApiQuery({ name: "endDate", required: false })
    async exportLogs(
        @Query("search") search?: string,
        @Query("role") role?: string,
        @Query("activityType") activityType?: string,
        @Query("status") status?: string,
        @Query("startDate") startDate?: string,
        @Query("endDate") endDate?: string,
        @Res({ passthrough: false }) res?: Response,
    ) {
        const csvContent = await this.auditLogService.exportLogsCsv({
            search,
            role,
            activityType,
            status,
            startDate,
            endDate,
        });

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
        const filename = `audit-logs-${timestamp}.csv`;

        res!.setHeader("Content-Type", "text/csv; charset=utf-8");
        res!.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res!.setHeader("Cache-Control", "no-cache");
        res!.send(csvContent);
    }

    @Post("log")
    @ApiOperation({ summary: "Create an audit log entry (internal/system use)" })
    async createLog(
        @Req() req: any,
        @Body()
        body: {
            userId?: string;
            userName: string;
            userRole: string;
            activityType: string;
            event: string;
            ipAddress?: string;
            sessionDue?: string;
            fileUrl?: string;
            status?: string;
        },
    ) {
        return this.auditLogService.createLog({
            ...body,
            ipAddress: body.ipAddress ?? req.ip,
        });
    }
}
