import { Roles } from "@common/decorators";
import { JwtAuthGuard, RolesGuard } from "@common/guards";
import { Controller, Get, Delete, Param, HttpStatus, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { BusinessIntelligenceService } from "./business-intelligence.service";
import { TrendFilter, TrendQueryDto, DropOffQueryDto } from "./dto/bi-query.dto";

@ApiTags("(Compliance) Business Intelligence")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
@Controller("compliance/business-intelligence")
export class BusinessIntelligenceController {
    constructor(private readonly biService: BusinessIntelligenceService) {}

    @Get("stats")
    @ApiOperation({ summary: "Key business metrics: revenue, refund, patients, rates, LTV, churn" })
    async getStats(@Query() query: TrendQueryDto) {
        const data = await this.biService.getStats(query.filter ?? TrendFilter.LAST_7_DAYS);
        return {
            success: true,
            statusCode: HttpStatus.OK,
            message: "Stats fetched successfully",
            data,
        };
    }

    @Get("category-revenue")
    @ApiOperation({ summary: "Revenue breakdown per assessment category with percentage" })
    async getCategoryRevenue(@Query() query: TrendQueryDto) {
        const data = await this.biService.getCategoryRevenue(query.filter ?? TrendFilter.LAST_7_DAYS);
        return {
            success: true,
            statusCode: HttpStatus.OK,
            message: "Category revenue fetched successfully",
            data,
        };
    }

    @Get("revenue-vs-refund")
    @ApiOperation({
        summary: "Revenue vs Refund trend chart (last_7_days / last_month / last_year)",
    })
    async getRevenueVsRefund(@Query() query: TrendQueryDto) {
        const data = await this.biService.getRevenueVsRefund(
            query.filter ?? TrendFilter.LAST_7_DAYS,
        );
        return {
            success: true,
            statusCode: HttpStatus.OK,
            message: "Revenue vs refund trend fetched successfully",
            data,
        };
    }

    @Get("patient-growth")
    @ApiOperation({ summary: "Patient registration growth trend chart" })
    async getPatientGrowth(@Query() query: TrendQueryDto) {
        const data = await this.biService.getPatientGrowth(query.filter ?? TrendFilter.LAST_7_DAYS);
        return {
            success: true,
            statusCode: HttpStatus.OK,
            message: "Patient growth fetched successfully",
            data,
        };
    }

    @Get("approval-vs-denial")
    @ApiOperation({ summary: "Assessment submission approval vs denial counts and percentages" })
    async getApprovalVsDenial(@Query() query: TrendQueryDto) {
        const data = await this.biService.getApprovalVsDenial(query.filter ?? TrendFilter.LAST_7_DAYS);
        return {
            success: true,
            statusCode: HttpStatus.OK,
            message: "Approval vs denial fetched successfully",
            data,
        };
    }

    @Get("revenue-by-service")
    @ApiOperation({ summary: "Revenue amount and percentage breakdown by service category" })
    async getRevenueByService() {
        const data = await this.biService.getRevenueByService();
        return {
            success: true,
            statusCode: HttpStatus.OK,
            message: "Revenue by service fetched successfully",
            data,
        };
    }

    // ── /drop-off ──────────────────────────────────────────────────────────────

    @Get("drop-off")
    @ApiOperation({ summary: "Get paginated list of intake drop-offs (DRAFT submissions)" })
    async getDropOffs(@Query() query: DropOffQueryDto) {
        const data = await this.biService.getDropOffs(query);
        return {
            success: true,
            statusCode: HttpStatus.OK,
            message: "Drop-offs fetched successfully",
            ...data,
        };
    }

    @Get("drop-off/:id")
    @ApiOperation({ summary: "Get single intake drop-off" })
    async getDropOffById(@Param("id") id: string) {
        const data = await this.biService.getDropOffById(id);
        return {
            success: true,
            statusCode: HttpStatus.OK,
            message: "Drop-off fetched successfully",
            data,
        };
    }

    @Delete("drop-off/:id")
    @ApiOperation({ summary: "Delete an intake drop-off" })
    async deleteDropOff(@Param("id") id: string) {
        const data = await this.biService.deleteDropOff(id);
        return {
            success: true,
            statusCode: HttpStatus.OK,
            message: data.message,
        };
    }
}
