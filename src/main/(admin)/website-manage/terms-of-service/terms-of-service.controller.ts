import { Roles } from "@common/decorators";
import { JwtAuthGuard, RolesGuard } from "@common/guards";
import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UpdateTermsOfServiceDto } from "./dto/update-terms-of-service.dto";
import { TermsOfServiceService } from "./terms-of-service.service";

@ApiTags("Website Manage - Terms of Service")
@Controller("website-manage/terms-of-service")
export class TermsOfServiceController {
    constructor(private readonly termsOfServiceService: TermsOfServiceService) {}

    @Get()
    @ApiOperation({ summary: "Get Terms of Service (Public API)" })
    get() {
        return this.termsOfServiceService.get();
    }

    @Patch()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIN")
    @ApiBearerAuth()
    @ApiOperation({ summary: "Update Terms of Service (Admin only)" })
    update(@Body() dto: UpdateTermsOfServiceDto) {
        return this.termsOfServiceService.update(dto);
    }
}
