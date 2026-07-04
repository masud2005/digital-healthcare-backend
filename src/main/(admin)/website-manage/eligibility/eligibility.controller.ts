import { Roles } from "@common/decorators";
import { JwtAuthGuard, RolesGuard } from "@common/guards";
import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { EligibilityService } from "./eligibility.service";
import { UpdateEligibilityDto } from "./dto/update-eligibility.dto";

@ApiTags("Website Manage - Eligibility")
@Controller("website-manage/eligibility")
export class EligibilityController {
    constructor(private readonly eligibilityService: EligibilityService) {}

    //
    @Get()
    @ApiOperation({ summary: "Get Eligibility page content (Public API)" })
    get() {
        return this.eligibilityService.get();
    }

    @Patch()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIN")
    @ApiBearerAuth()
    @ApiOperation({ summary: "Update Eligibility page content (Admin only)" })
    update(@Body() dto: UpdateEligibilityDto) {
        return this.eligibilityService.update(dto);
    }
}
