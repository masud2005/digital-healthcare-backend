import { Roles } from "@common/decorators";
import { JwtAuthGuard, RolesGuard } from "@common/guards";
import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UpdateContactSideWidgetDto } from "./dto/update-contact-side-widget.dto";
import { ContactSideWidgetService } from "./contact-side-widget.service";

@ApiTags("Website Manage - Contact Side Widget")
@Controller("website-manage/contact-side-widget")
export class ContactSideWidgetController {
    constructor(private readonly service: ContactSideWidgetService) {}

    @Get()
    @ApiOperation({ summary: "Get Contact Side Widget (Public API)" })
    get() {
        return this.service.get();
    }

    @Patch()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIN")
    @ApiBearerAuth()
    @ApiOperation({ summary: "Update Contact Side Widget (Admin only)" })
    update(@Body() dto: UpdateContactSideWidgetDto) {
        return this.service.update(dto);
    }
}
