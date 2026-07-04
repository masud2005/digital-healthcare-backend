import { Roles } from "@common/decorators";
import { JwtAuthGuard, RolesGuard } from "@common/guards";
import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UpdateHippaNoticeDto } from "./dto/update-hippa-notice.dto";
import { HippaNoticeService } from "./hippa-notice.service";

@ApiTags("Website Manage - HIPAA Notice")
@Controller("website-manage/hippa-notice")
export class HippaNoticeController {
    constructor(private readonly hippaNoticeService: HippaNoticeService) {}

    @Get()
    @ApiOperation({ summary: "Get HIPAA Notice (Public API)" })
    get() {
        return this.hippaNoticeService.get();
    }

    @Patch()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIN")
    @ApiBearerAuth()
    @ApiOperation({ summary: "Update HIPAA Notice (Admin only)" })
    update(@Body() dto: UpdateHippaNoticeDto) {
        return this.hippaNoticeService.update(dto);
    }
}
