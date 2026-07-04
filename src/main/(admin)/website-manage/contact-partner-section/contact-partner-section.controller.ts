import { Roles } from "@common/decorators";
import { JwtAuthGuard, RolesGuard } from "@common/guards";
import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UpdateContactPartnerSectionDto } from "./dto/update-contact-partner-section.dto";
import { ContactPartnerSectionService } from "./contact-partner-section.service";

@ApiTags("Website Manage - Contact Partner Section")
@Controller("website-manage/contact-partner-section")
export class ContactPartnerSectionController {
    constructor(private readonly service: ContactPartnerSectionService) {}

    @Get()
    @ApiOperation({ summary: "Get Contact Partner Section (Public API)" })
    get() {
        return this.service.get();
    }
    
    @Patch()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIN")
    @ApiBearerAuth()
    @ApiOperation({ summary: "Update Contact Partner Section (Admin only)" })
    update(@Body() dto: UpdateContactPartnerSectionDto) {
        return this.service.update(dto);
    }
}
