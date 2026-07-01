import { AppPermission } from "@common/auth/permissions.constants";
import { RequirePermissions } from "@common/decorators";
import { JwtAuthGuard, PermissionsGuard } from "@common/guards";
import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { DashboardService } from "./dashboard.service";

@ApiTags("(Admin) Dashboard Overview")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions(AppPermission.VIEW_DASHBOARD)
@Controller("admin/dashboard")
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get("stats")
    @ApiOperation({
        summary: "Get dashboard stats",
        description:
            "Returns total patients, total doctors, active categories, " +
            "and total assessment submissions (excluding DRAFT status).",
    })
    @ApiOkResponse({
        description: "Dashboard statistics",
        schema: {
            example: {
                success: true,
                statusCode: 200,
                message: "Dashboard stats fetched successfully",
                data: {
                    totalPatients: 120,
                    totalDoctors: 15,
                    activeCategories: 8,
                    totalAssessmentSubmissions: 340,
                },
            },
        },
    })
    getStats() {
        return this.dashboardService.getStats();
    }

    @Get("recent-activity")
    @ApiOperation({
        summary: "Get recent 5 patients",
        description:
            "Returns the latest 5 registered patients with the same structure as all-patients API.",
    })
    @ApiOkResponse({ description: "Latest 5 patients" })
    getRecentActivity() {
        return this.dashboardService.getRecentActivity();
    }
}
