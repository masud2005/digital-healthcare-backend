import { Body, Controller, Get, Post, Query, Req } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuditLogService } from "./audit-log.service";
import { AuditLogQueryDto } from "./dto/audit-log-query.dto";
import {
    AuditLogListResponseDto,
    AuditLogStatsResponseDto,
} from "./dto/audit-log-response.dto";

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

    @Post("export")
    @ApiOperation({ summary: "Export activity logs as CSV (Simulated)" })
    async exportLogs(
        @Req() req: any,
        @Body() body: { search?: string; role?: string; activityType?: string; status?: string },
    ) {
        // Log the export action
        await this.auditLogService.createLog({
            userName: req.user?.name || "Admin",
            userRole: req.user?.role || "Admin",
            activityType: "Data Export",
            event: "User exported CSV data",
            ipAddress: req.ip || "192.168.1.45",
            sessionDue: "12m 34s",
            status: "SUCCESS",
        });

        return {
            success: true,
            message: "CSV export triggered successfully. Check your email or download queue.",
            downloadUrl: "https://example.com/downloads/activity_logs.csv",
        };
    }
}
