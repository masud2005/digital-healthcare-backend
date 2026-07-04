import { Roles } from "@common/decorators";
import { JwtAuthGuard, RolesGuard } from "@common/guards";
import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UpdatePrivacyPolicyDto } from "./dto/update-privacy-policy.dto";
import { PrivacyPolicyService } from "./privacy-policy.service";

@ApiTags("Website Manage - Privacy Policy")
@Controller("website-manage/privacy-policy")
export class PrivacyPolicyController {
    constructor(private readonly privacyPolicyService: PrivacyPolicyService) {}

    @Get()
    @ApiOperation({ summary: "Get Privacy Policy (Public API)" })
    get() {
        return this.privacyPolicyService.get();
    }

    @Patch()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIN")
    @ApiBearerAuth()
    @ApiOperation({ summary: "Update Privacy Policy (Admin only)" })
    update(@Body() dto: UpdatePrivacyPolicyDto) {
        return this.privacyPolicyService.update(dto);
    }
}
