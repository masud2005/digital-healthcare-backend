import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from "@nestjs/common";
import {
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from "@nestjs/swagger";
import { CreateIncidentDto } from "./dto/create-incident.dto";
import { IncidentParamDto } from "./dto/incident-param.dto";
import { IncidentQueryDto } from "./dto/incident-query.dto";
import {
    IncidentListResponseDto,
    IncidentOverviewResponseDto,
    IncidentResponseDto,
} from "./dto/incident-response.dto";
import { UpdateIncidentDto } from "./dto/update-incident.dto";
import { IncidentService } from "./incident.service";

@ApiTags("Compliance Incident Management")
@Controller("compliance/incidents")
export class IncidentController {
    constructor(private readonly incidentService: IncidentService) {}

    @Post()
    @ApiOperation({ summary: "Create an incident" })
    @ApiCreatedResponse({ type: IncidentResponseDto })
    create(@Body() payload: CreateIncidentDto) {
        return this.incidentService.create(payload);
    }

    @Get("overview")
    @ApiOperation({ summary: "Get incident management overview" })
    @ApiOkResponse({ type: IncidentOverviewResponseDto })
    getOverview() {
        return this.incidentService.getOverview();
    }

    @Get()
    @ApiOperation({ summary: "Get incidents" })
    @ApiOkResponse({ type: IncidentListResponseDto })
    findAll(@Query() query: IncidentQueryDto) {
        return this.incidentService.findAll(query);
    }

    @Get(":id")
    @ApiOperation({ summary: "Get an incident by id" })
    @ApiOkResponse({ type: IncidentResponseDto })
    findOne(@Param() params: IncidentParamDto) {
        return this.incidentService.findOne(params.id);
    }

    @Patch(":id")
    @ApiOperation({ summary: "Update an incident" })
    @ApiOkResponse({ type: IncidentResponseDto })
    update(@Param() params: IncidentParamDto, @Body() payload: UpdateIncidentDto) {
        return this.incidentService.update(params.id, payload);
    }

    @Delete(":id")
    @HttpCode(204)
    @ApiOperation({ summary: "Delete an incident" })
    @ApiNoContentResponse({ description: "Incident deleted successfully" })
    async remove(@Param() params: IncidentParamDto) {
        await this.incidentService.remove(params.id);
    }
}
