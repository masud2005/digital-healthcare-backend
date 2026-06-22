import { Body, Controller, Get, Patch } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { WebsiteSettingsResponseDto } from "./dto/website-settings-response.dto";
import { UpdateSiteSettingsDto } from "./dto/update-site-settings.dto";
import { UpdateOfficeAddressesDto } from "./dto/update-office-addresses.dto";
import { UpdateContactInfoDto } from "./dto/update-contact-info.dto";
import { UpdateSocialLinksDto } from "./dto/update-social-links.dto";
import { UpdateGoogleAnalyticsDto } from "./dto/update-google-analytics.dto";
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

    @Patch("site-settings")
    @ApiOperation({ summary: "Update core site settings" })
    @ApiOkResponse({ type: WebsiteSettingsResponseDto })
    updateSiteSettings(@Body() payload: UpdateSiteSettingsDto) {
        return this.websiteService.updateSettings(payload);
    }

    @Patch("office-addresses")
    @ApiOperation({ summary: "Update office addresses" })
    @ApiOkResponse({ type: WebsiteSettingsResponseDto })
    updateOfficeAddresses(@Body() payload: UpdateOfficeAddressesDto) {
        return this.websiteService.updateSettings(payload);
    }

    @Patch("contact-info")
    @ApiOperation({ summary: "Update contact info" })
    @ApiOkResponse({ type: WebsiteSettingsResponseDto })
    updateContactInfo(@Body() payload: UpdateContactInfoDto) {
        return this.websiteService.updateSettings({ contactInfo: payload });
    }

    @Patch("social-links")
    @ApiOperation({ summary: "Update social links" })
    @ApiOkResponse({ type: WebsiteSettingsResponseDto })
    updateSocialLinks(@Body() payload: UpdateSocialLinksDto) {
        return this.websiteService.updateSettings(payload);
    }

    @Patch("google-analytics")
    @ApiOperation({ summary: "Update Google Analytics settings" })
    @ApiOkResponse({ type: WebsiteSettingsResponseDto })
    updateGoogleAnalytics(@Body() payload: UpdateGoogleAnalyticsDto) {
        return this.websiteService.updateSettings({ googleAnalytics: payload });
    }
}
