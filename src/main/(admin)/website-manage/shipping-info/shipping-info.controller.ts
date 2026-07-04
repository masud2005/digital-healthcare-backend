import { Roles } from "@common/decorators";
import { JwtAuthGuard, RolesGuard } from "@common/guards";
import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UpdateShippingInfoDto } from "./dto/update-shipping-info.dto";
import { ShippingInfoService } from "./shipping-info.service";

@ApiTags("Website Manage - Shipping Info")
@Controller("website-manage/shipping-info")
export class ShippingInfoController {
    constructor(private readonly service: ShippingInfoService) {}

    @Get()
    @ApiOperation({ summary: "Get Shipping Info Content (Public API)" })
    get() {
        return this.service.get();
    }

    @Patch()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIN")
    @ApiBearerAuth()
    @ApiOperation({ summary: "Update Shipping Info Content (Admin only)" })
    update(@Body() dto: UpdateShippingInfoDto) {
        return this.service.update(dto);
    }
}
