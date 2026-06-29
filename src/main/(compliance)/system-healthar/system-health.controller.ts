import { RequirePermissions } from "@common/decorators";
import { AppPermission } from "@common/auth/permissions.constants";
import { JwtAuthGuard, PermissionsGuard } from "@common/guards";
import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { SystemHealthSummaryResponseDto } from "./dto/system-health-response.dto";
import { SystemHealthService } from "./system-health.service";

@ApiTags("(Compliance) System Health")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("compliance/system-health")
export class SystemHealthController {
    constructor(private readonly systemHealthService: SystemHealthService) {}

    @Get()
    @RequirePermissions(AppPermission.VIEW_SYSTEM_HEALTH)
    @ApiOperation({
        summary: "Get full system health overview",
        description:
            "Returns all service statuses (server, email, SMS, payments, database, login) " +
            "and real-time system metrics (CPU, memory, disk, requests/min, error rate, " +
            "active users) sourced directly from the database. " +
            "Requires the 'view:system_health' permission. ADMIN role bypasses automatically.",
    })
    @ApiOkResponse({ type: SystemHealthSummaryResponseDto })
    getOverview() {
        return this.systemHealthService.getOverview();
    }
}
