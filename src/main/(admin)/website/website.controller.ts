import { Roles } from "@common/decorators";
import { JwtAuthGuard, RolesGuard } from "@common/guards";
import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UpdateContactInfoDto } from "./dto/update-contact-info.dto";
import { UpdateGoogleAnalyticsDto } from "./dto/update-google-analytics.dto";
import { UpdateOfficeAddressesDto } from "./dto/update-office-addresses.dto";
import { UpdateSiteSettingsDto } from "./dto/update-site-settings.dto";
import { UpdateSocialLinksDto } from "./dto/update-social-links.dto";
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

    @Patch("site-settings")
    @ApiOperation({ summary: "Update core site settings" })
    @ApiOkResponse({ type: WebsiteSettingsResponseDto })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIN")
    updateSiteSettings(@Body() payload: UpdateSiteSettingsDto) {
        return this.websiteService.updateSettings(payload);
    }

    @Patch("office-addresses")
    @ApiOperation({ summary: "Update office addresses" })
    @ApiOkResponse({ type: WebsiteSettingsResponseDto })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIN")
    updateOfficeAddresses(@Body() payload: UpdateOfficeAddressesDto) {
        return this.websiteService.updateSettings(payload);
    }

    @Patch("contact-info")
    @ApiOperation({ summary: "Update contact info" })
    @ApiOkResponse({ type: WebsiteSettingsResponseDto })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIN")
    updateContactInfo(@Body() payload: UpdateContactInfoDto) {
        return this.websiteService.updateSettings({ contactInfo: payload });
    }

    @Patch("social-links")
    @ApiOperation({ summary: "Update social links" })
    @ApiOkResponse({ type: WebsiteSettingsResponseDto })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIN")
    updateSocialLinks(@Body() payload: UpdateSocialLinksDto) {
        return this.websiteService.updateSettings(payload);
    }

    @Patch("google-analytics")
    @ApiOperation({ summary: "Update Google Analytics settings" })
    @ApiOkResponse({ type: WebsiteSettingsResponseDto })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIN")
    updateGoogleAnalytics(@Body() payload: UpdateGoogleAnalyticsDto) {
        return this.websiteService.updateSettings({ googleAnalytics: payload });
    }
}
