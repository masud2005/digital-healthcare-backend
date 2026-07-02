import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { WebsiteService } from "../../(admin)/website/website.service";
import { WebsiteSettingsResponseDto } from "../../(admin)/website/dto/website-settings-response.dto";

@ApiTags("(Public) Website Settings")
@Controller("public/website-settings")
export class PublicWebsiteController {
    constructor(private readonly websiteService: WebsiteService) {}

    @Get()
    @ApiOperation({ summary: "Get website settings" })
    @ApiOkResponse({ type: WebsiteSettingsResponseDto })
    getSettings() {
        return this.websiteService.getSettings();
    }
}
