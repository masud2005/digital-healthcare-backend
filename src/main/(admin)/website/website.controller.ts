import { AppPermission } from "@common/auth/permissions.constants";
import { RequirePermissions } from "@common/decorators";
import { JwtAuthGuard, PermissionsGuard } from "@common/guards";
import { Body, Controller, Get, Headers, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UpdateContactInfoDto } from "./dto/update-contact-info.dto";
import { UpdateGoogleAnalyticsDto } from "./dto/update-google-analytics.dto";
import { OfficeLocationDto } from "./dto/update-office-addresses.dto";
import { UpdateSiteSettingsDto } from "./dto/update-site-settings.dto";
import { UpdateSocialLinksDto } from "./dto/update-social-links.dto";
import { WebsiteSettingsResponseDto } from "./dto/website-settings-response.dto";
import { WebsiteService } from "./website.service";

@ApiTags("(Admin) Website Settings")
@Controller("admin/website-settings")
export class WebsiteController {
    constructor(private readonly websiteService: WebsiteService) {}

    // Public — used by the frontend to fetch settings without auth
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
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions(AppPermission.MANAGE_WEBSITE_MANAGEMENT)
    updateSiteSettings(@Body() payload: UpdateSiteSettingsDto) {
        return this.websiteService.updateSettings(payload);
    }

    @Patch("office-addresses")
    @ApiOperation({ summary: "Update a single office address" })
    @ApiOkResponse({ type: WebsiteSettingsResponseDto })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions(AppPermission.MANAGE_WEBSITE_MANAGEMENT)
    updateOfficeAddress(@Headers("id") officeId: string, @Body() payload: OfficeLocationDto) {
        return this.websiteService.updateOfficeAddress(officeId, payload);
    }

    @Patch("contact-info")
    @ApiOperation({ summary: "Update contact info" })
    @ApiOkResponse({ type: WebsiteSettingsResponseDto })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions(AppPermission.MANAGE_WEBSITE_MANAGEMENT)
    updateContactInfo(@Body() payload: UpdateContactInfoDto) {
        return this.websiteService.updateSettings({ contactInfo: payload });
    }

    @Patch("social-links")
    @ApiOperation({ summary: "Update social links" })
    @ApiOkResponse({ type: WebsiteSettingsResponseDto })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions(AppPermission.MANAGE_WEBSITE_MANAGEMENT)
    updateSocialLinks(@Body() payload: UpdateSocialLinksDto) {
        return this.websiteService.updateSettings(payload);
    }

    @Patch("google-analytics")
    @ApiOperation({ summary: "Update Google Analytics settings" })
    @ApiOkResponse({ type: WebsiteSettingsResponseDto })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions(AppPermission.MANAGE_WEBSITE_MANAGEMENT)
    updateGoogleAnalytics(@Body() payload: UpdateGoogleAnalyticsDto) {
        return this.websiteService.updateSettings({ googleAnalytics: payload });
    }
}
