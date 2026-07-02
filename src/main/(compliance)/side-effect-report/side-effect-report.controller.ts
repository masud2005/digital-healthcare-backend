import { AppPermission } from "@common/auth/permissions.constants";
import { RequirePermissions } from "@common/decorators";
import { JwtAuthGuard, PermissionsGuard } from "@common/guards";
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Patch,
    Query,
    UseGuards,
} from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from "@nestjs/swagger";
import { SideEffectReportParamDto } from "./dto/side-effect-report-param.dto";
import { SideEffectReportQueryDto } from "./dto/side-effect-report-query.dto";
import {
    SideEffectReportListResponseDto,
    SideEffectReportOverviewResponseDto,
    SideEffectReportResponseDto,
} from "./dto/side-effect-report-response.dto";
import { UpdateSideEffectReportDto } from "./dto/update-side-effect-report.dto";
import { SideEffectReportService } from "./side-effect-report.service";

@ApiTags("(Compliance) Side Effect Reports")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("compliance/side-effect-reports")
export class SideEffectReportController {
    constructor(private readonly sideEffectReportService: SideEffectReportService) {}

    @Get("overview")
    @RequirePermissions(AppPermission.VIEW_COMPLIANCE_CENTER)
    @ApiOperation({ summary: "Get side effect reports overview counts" })
    @ApiOkResponse({ type: SideEffectReportOverviewResponseDto })
    getOverview() {
        return this.sideEffectReportService.getOverview();
    }

    @Get()
    @RequirePermissions(AppPermission.VIEW_COMPLIANCE_CENTER)
    @ApiOperation({ summary: "Get side effect reports with pagination/filters" })
    @ApiOkResponse({ type: SideEffectReportListResponseDto })
    findAll(@Query() query: SideEffectReportQueryDto) {
        return this.sideEffectReportService.findAll(query);
    }

    @Get(":id")
    @RequirePermissions(AppPermission.VIEW_COMPLIANCE_CENTER)
    @ApiOperation({ summary: "Get a side effect report by id" })
    @ApiOkResponse({ type: SideEffectReportResponseDto })
    findOne(@Param() params: SideEffectReportParamDto) {
        return this.sideEffectReportService.findOne(params.id);
    }

    @Patch(":id")
    @RequirePermissions(AppPermission.MANAGE_COMPLIANCE_CENTER)
    @ApiOperation({ summary: "Update a side effect report status/severity" })
    @ApiOkResponse({ type: SideEffectReportResponseDto })
    update(@Param() params: SideEffectReportParamDto, @Body() payload: UpdateSideEffectReportDto) {
        return this.sideEffectReportService.update(params.id, payload);
    }

    @Delete(":id")
    @RequirePermissions(AppPermission.MANAGE_COMPLIANCE_CENTER)
    @HttpCode(204)
    @ApiOperation({ summary: "Delete a side effect report" })
    @ApiNoContentResponse({ description: "Side effect report deleted successfully" })
    async remove(@Param() params: SideEffectReportParamDto) {
        await this.sideEffectReportService.remove(params.id);
    }
}
