import { CurrentUser } from "@common/decorators/current-user.decorator";
import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import type { AuthenticatedUser } from "@main/auth/auth.types";
import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { DashboardService } from "./dashboard.service";
import { DashboardStatsResponseDto } from "./dto/dashboard.dto";

@ApiTags("(Patient) Dashboard")
@ApiBearerAuth()
@Controller("dashboard")
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @UseGuards(JwtAuthGuard)
    @Get("stats")
    @ApiOperation({
        summary: "Get dashboard statistics",
        description:
            "Returns assessment submission counts for all statuses and total successful payment amount.",
    })
    @ApiOkResponse({ type: DashboardStatsResponseDto })
    async getStats(@CurrentUser() user: AuthenticatedUser) {
        const result = await this.dashboardService.getStats(user.id);
        return {
            success: true,
            statusCode: 200,
            message: "Dashboard statistics retrieved successfully",
            data: result,
        };
    }
}
