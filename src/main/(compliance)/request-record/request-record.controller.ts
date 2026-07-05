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
import { RequestRecordParamDto } from "./dto/request-record-param.dto";
import { RequestRecordQueryDto } from "./dto/request-record-query.dto";
import {
    RequestRecordListResponseDto,
    RequestRecordOverviewResponseDto,
    RequestRecordResponseDto,
} from "./dto/request-record-response.dto";
import { UpdateRequestRecordDto } from "./dto/update-request-record.dto";
import { RequestRecordService } from "./request-record.service";

@ApiTags("(Compliance) Request Records")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("compliance/request-records")
export class RequestRecordController {
    constructor(private readonly requestRecordService: RequestRecordService) {}

    @Get("overview")
    @RequirePermissions(AppPermission.VIEW_COMPLIANCE_CENTER)
    @ApiOperation({ summary: "Get request records overview counts" })
    @ApiOkResponse({ type: RequestRecordOverviewResponseDto })
    getOverview() {
        return this.requestRecordService.getOverview();
    }

    @Get()
    @RequirePermissions(AppPermission.VIEW_COMPLIANCE_CENTER)
    @ApiOperation({ summary: "Get request records with pagination/filters" })
    @ApiOkResponse({ type: RequestRecordListResponseDto })
    findAll(@Query() query: RequestRecordQueryDto) {
        return this.requestRecordService.findAll(query);
    }

    @Get(":id")
    @RequirePermissions(AppPermission.VIEW_COMPLIANCE_CENTER)
    @ApiOperation({ summary: "Get a request record by id" })
    @ApiOkResponse({ type: RequestRecordResponseDto })
    findOne(@Param() params: RequestRecordParamDto) {
        return this.requestRecordService.findOne(params.id);
    }

    @Patch(":id")
    @RequirePermissions(AppPermission.MANAGE_COMPLIANCE_CENTER)
    @ApiOperation({ summary: "Update a request record status" })
    @ApiOkResponse({ type: RequestRecordResponseDto })
    update(@Param() params: RequestRecordParamDto, @Body() payload: UpdateRequestRecordDto) {
        return this.requestRecordService.update(params.id, payload);
    }

    @Delete(":id")
    @RequirePermissions(AppPermission.MANAGE_COMPLIANCE_CENTER)
    @HttpCode(204)
    @ApiOperation({ summary: "Delete a request record" })
    @ApiNoContentResponse({ description: "Request record deleted successfully" })
    async remove(@Param() params: RequestRecordParamDto) {
        await this.requestRecordService.remove(params.id);
    }
}
