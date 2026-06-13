import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { SystemHealthParamDto } from "./dto/system-health-param.dto";
import { SystemHealthMetricQueryDto } from "./dto/system-health-metric-query.dto";
import { SystemHealthQueryDto } from "./dto/system-health-query.dto";
import {
    SystemHealthListResponseDto,
    SystemHealthMetricListResponseDto,
    SystemHealthMetricResponseDto,
    SystemHealthResponseDto,
    SystemHealthSummaryResponseDto,
} from "./dto/system-health-response.dto";
import { SystemHealthService } from "./system-health.service";

@ApiTags("(Compliance) System Health")
@Controller("compliance/system-health")
export class SystemHealthController {
    constructor(private readonly systemHealthService: SystemHealthService) {}

    @Get("overview")
    @ApiOperation({ summary: "Get system health overview" })
    @ApiOkResponse({ type: SystemHealthSummaryResponseDto })
    getOverview() {
        return this.systemHealthService.getOverview();
    }

    @Get("services")
    @ApiOperation({ summary: "Get system health services" })
    @ApiOkResponse({ type: SystemHealthListResponseDto })
    findAll(@Query() query: SystemHealthQueryDto) {
        return this.systemHealthService.findAll(query);
    }

    @Get("services/:id")
    @ApiOperation({ summary: "Get a system health service by id" })
    @ApiOkResponse({ type: SystemHealthResponseDto })
    findOne(@Param() params: SystemHealthParamDto) {
        return this.systemHealthService.findOne(params.id);
    }

    @Get("metrics")
    @ApiOperation({ summary: "Get system health metrics" })
    @ApiOkResponse({ type: SystemHealthMetricListResponseDto })
    findAllMetrics(@Query() query: SystemHealthMetricQueryDto) {
        return this.systemHealthService.findAllMetrics(query);
    }

    @Get("metrics/:id")
    @ApiOperation({ summary: "Get a system health metric by id" })
    @ApiOkResponse({ type: SystemHealthMetricResponseDto })
    findOneMetric(@Param() params: SystemHealthParamDto) {
        return this.systemHealthService.findOneMetric(params.id);
    }
}
