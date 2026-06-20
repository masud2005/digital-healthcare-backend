import { Body, Controller, Get, Patch } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UpdateWebsiteSettingsDto } from "./dto/update-website-settings.dto";
import { WebsiteSettingsResponseDto } from "./dto/website-settings-response.dto";
import { WebsiteService } from "./website.service";

@ApiTags("(Admin) Website Settings")
@Controller("admin/website-settings")
export class WebsiteController {
    constructor(private readonly websiteService: WebsiteService) {}

    @Get()
    @ApiOperation({ summary: "Get website settings" })
    @ApiOkResponse({ type: WebsiteSettingsResponseDto })
    getSettings() {
        return this.websiteService.getSettings();
    }

    @Patch()
    @ApiOperation({ summary: "Update website settings" })
    @ApiOkResponse({ type: WebsiteSettingsResponseDto })
    updateSettings(
        @Body() payload: UpdateWebsiteSettingsDto,
    ) {
        return this.websiteService.updateSettings(payload);
    }
}
