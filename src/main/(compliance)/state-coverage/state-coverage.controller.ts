import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Put,
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
import { AppPermission } from "@common/auth/permissions.constants";
import { RequirePermissions } from "@common/decorators";
import { JwtAuthGuard, PermissionsGuard } from "@common/guards";
import { StateCoverageParamDto } from "./dto/state-coverage-param.dto";
import { StateCoverageQueryDto } from "./dto/state-coverage-query.dto";
import { CheckAvailabilityQueryDto } from "./dto/check-availability-query.dto";
import {
    StateCoverageListResponseDto,
    StateCoverageResponseDto,
} from "./dto/state-coverage-response.dto";
import { UpdateStateRestrictionsDto } from "./dto/update-state-restrictions.dto";
import { StateCoverageService } from "./state-coverage.service";

@ApiTags("(Compliance) State Coverage")
@Controller("compliance/state-coverages")
export class StateCoverageController {
    constructor(private readonly stateCoverageService: StateCoverageService) {}

    @Get("check-availability")
    @ApiOperation({ summary: "Check state coverage availability by category and/or state IDs" })
    @ApiOkResponse({ type: [StateCoverageResponseDto] })
    checkAvailability(@Query() query: CheckAvailabilityQueryDto) {
        return this.stateCoverageService.checkAvailability(query);
    }

    @Get()
    @ApiOperation({ summary: "Get state coverages with pagination and filters" })
    @ApiOkResponse({ type: StateCoverageListResponseDto })
    findAll(@Query() query: StateCoverageQueryDto) {
        return this.stateCoverageService.findAll(query);
    }

    @Get(":id")
    @ApiOperation({ summary: "Get a single state coverage configuration by id" })
    @ApiOkResponse({ type: StateCoverageResponseDto })
    findOne(@Param() params: StateCoverageParamDto) {
        return this.stateCoverageService.findOne(params.id);
    }

    @Put(":id/restrictions")
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions(AppPermission.MANAGE_STATE_COVERAGE)
    @ApiOperation({ summary: "Update allowed services and coming soon status for a state" })
    @ApiOkResponse({ type: StateCoverageResponseDto })
    updateRestrictions(
        @Param() params: StateCoverageParamDto,
        @Body() payload: UpdateStateRestrictionsDto,
    ) {
        return this.stateCoverageService.updateRestrictions(params.id, payload);
    }

    @Delete(":id")
    @HttpCode(204)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions(AppPermission.MANAGE_STATE_COVERAGE)
    @ApiOperation({ summary: "Delete a state coverage configuration" })
    @ApiNoContentResponse({ description: "State coverage configuration deleted successfully" })
    async remove(@Param() params: StateCoverageParamDto) {
        await this.stateCoverageService.remove(params.id);
    }
}
