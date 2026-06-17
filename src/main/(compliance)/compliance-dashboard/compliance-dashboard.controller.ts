import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ComplianceDashboardService } from "./compliance-dashboard.service";
import { ComplianceDashboardResponseDto } from "./compliance-dashboard-response.dto";

@ApiTags("(Compliance) Dashboard")
@Controller("compliance/dashboard")
export class ComplianceDashboardController {
    constructor(private readonly complianceDashboardService: ComplianceDashboardService) {}

    @Get()
    @ApiOperation({
        summary: "Get compliance center dashboard KPIs",
        description:
            "Returns all 6 top KPI cards (HIPAA score, consent completion, security alerts, failed logins 24h, MFA adoption, audit log count) plus the compliance status breakdown panel.",
    })
    @ApiOkResponse({ type: ComplianceDashboardResponseDto })
    getDashboard() {
        return this.complianceDashboardService.getDashboard();
    }
}
