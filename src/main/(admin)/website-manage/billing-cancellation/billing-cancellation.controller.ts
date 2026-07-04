import { Roles } from "@common/decorators";
import { JwtAuthGuard, RolesGuard } from "@common/guards";
import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { BillingCancellationService } from "./billing-cancellation.service";
import { UpdateBillingCancellationDto } from "./dto/update-billing-cancellation.dto";

@ApiTags("Website Manage - Billing & Cancellation")
@Controller("website-manage/billing-cancellation")
export class BillingCancellationController {
    constructor(private readonly service: BillingCancellationService) {}

    @Get()
    @ApiOperation({ summary: "Get Billing & Cancellation page content (Public API)" })
    get() {
        return this.service.get();
    }

    @Patch()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIN")
    @ApiBearerAuth()
    @ApiOperation({ summary: "Update Billing & Cancellation page content (Admin only)" })
    update(@Body() dto: UpdateBillingCancellationDto) {
        return this.service.update(dto);
    }
}
