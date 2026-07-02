import { CurrentUser } from "@common/decorators/current-user.decorator";
import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import type { AuthenticatedUser } from "@main/auth/auth.types";
import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { DoctorDashboardService } from "./dashboard.service";
import { DoctorDashboardStatsResponseDto } from "./dto/dashboard.dto";
import { Roles } from "@common/decorators";

@ApiTags("(Doctor) Dashboard")
@Controller("doctor/dashboard")
export class DoctorDashboardController {
    constructor(private readonly dashboardService: DoctorDashboardService) {}

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Roles("DOCTOR")
    @Get("stats")
    @ApiOperation({
        summary: "Get doctor dashboard statistics",
        description: "Returns aggregated counts for active, new, and declined consultations.",
    })
    @ApiOkResponse({ type: DoctorDashboardStatsResponseDto })
    async getStats(@CurrentUser() user: AuthenticatedUser) {
        const result = await this.dashboardService.getStats(user.id);
        return {
            success: true,
            statusCode: 200,
            message: "Doctor dashboard stats retrieved successfully",
            data: result,
        };
    }
}
