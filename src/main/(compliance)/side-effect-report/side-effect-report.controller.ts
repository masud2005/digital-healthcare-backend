import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from "@nestjs/common";
import {
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from "@nestjs/swagger";
import { CreateSideEffectReportDto } from "./dto/create-side-effect-report.dto";
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
@Controller("compliance/side-effect-reports")
export class SideEffectReportController {
    constructor(private readonly sideEffectReportService: SideEffectReportService) {}

    @Post()
    @ApiOperation({ summary: "Create a side effect report" })
    @ApiCreatedResponse({ type: SideEffectReportResponseDto })
    create(@Body() payload: CreateSideEffectReportDto) {
        return this.sideEffectReportService.create(payload);
    }

    @Get("overview")
    @ApiOperation({ summary: "Get side effect reports overview counts" })
    @ApiOkResponse({ type: SideEffectReportOverviewResponseDto })
    getOverview() {
        return this.sideEffectReportService.getOverview();
    }

    @Get()
    @ApiOperation({ summary: "Get side effect reports with pagination/filters" })
    @ApiOkResponse({ type: SideEffectReportListResponseDto })
    findAll(@Query() query: SideEffectReportQueryDto) {
        return this.sideEffectReportService.findAll(query);
    }

    @Get(":id")
    @ApiOperation({ summary: "Get a side effect report by id" })
    @ApiOkResponse({ type: SideEffectReportResponseDto })
    findOne(@Param() params: SideEffectReportParamDto) {
        return this.sideEffectReportService.findOne(params.id);
    }

    @Patch(":id")
    @ApiOperation({ summary: "Update a side effect report status/severity" })
    @ApiOkResponse({ type: SideEffectReportResponseDto })
    update(@Param() params: SideEffectReportParamDto, @Body() payload: UpdateSideEffectReportDto) {
        return this.sideEffectReportService.update(params.id, payload);
    }

    @Delete(":id")
    @HttpCode(204)
    @ApiOperation({ summary: "Delete a side effect report" })
    @ApiNoContentResponse({ description: "Side effect report deleted successfully" })
    async remove(@Param() params: SideEffectReportParamDto) {
        await this.sideEffectReportService.remove(params.id);
    }
}
