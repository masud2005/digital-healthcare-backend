import { Roles } from "@common/decorators";
import { JwtAuthGuard, RolesGuard } from "@common/guards";
import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UpdateReportSideEffectDto } from "./dto/update-report-side-effect.dto";
import { ReportSideEffectService } from "./report-side-effect.service";

@ApiTags("Website Manage - Report Side Effect")
@Controller("website-manage/report-side-effect")
export class ReportSideEffectController {
    constructor(private readonly service: ReportSideEffectService) {}

    @Get()
    @ApiOperation({ summary: "Get Report Side Effect content (Public API)" })
    get() {
        return this.service.get();
    }

    @Patch()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIN")
    @ApiBearerAuth()
    @ApiOperation({ summary: "Update Report Side Effect content (Admin only)" })
    update(@Body() dto: UpdateReportSideEffectDto) {
        return this.service.update(dto);
    }
}
