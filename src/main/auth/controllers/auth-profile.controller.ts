import { Body, Controller, Get, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import type { AuthenticatedUser } from "../auth.types";
import { AuthProfileResponseDto } from "../dto/auth-response.dto";
import { UpdatePreferenceDto } from "../dto/update-preference.dto";
import { UpdateProfileDto } from "../dto/update-profile.dto";
import { AuthAccountService } from "../services/auth-account.service";

@ApiTags("(Auth) Profile")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("auth")
export class AuthProfileController {
    constructor(private readonly authAccountService: AuthAccountService) {}

    @Get("me")
    @ApiOperation({ summary: "Get current authenticated user profile" })
    @ApiOkResponse({ type: AuthProfileResponseDto })
    getMe(@CurrentUser() user: AuthenticatedUser) {
        return this.authAccountService.getProfile(user.id);
    }

    @Patch("me")
    @ApiOperation({ summary: "Update current authenticated user profile (role-based)" })
    updateProfile(@CurrentUser() user: AuthenticatedUser, @Body() payload: UpdateProfileDto) {
        return this.authAccountService.updateProfile(user.id, payload);
    }

    @Post("me/toggle-mfa")
    @ApiOperation({
        summary: "Toggle MFA on/off",
        description: "If MFA is currently enabled, it will be disabled and vice versa.",
    })
    toggleMfa(@CurrentUser() user: AuthenticatedUser) {
        return this.authAccountService.toggleMfa(user.id);
    }

    @Get("me/preferences")
    @ApiOperation({ summary: "Get communication preferences" })
    getPreference(@CurrentUser() user: AuthenticatedUser) {
        return this.authAccountService.getPreference(user.id);
    }

    @Patch("me/preferences")
    @ApiOperation({ summary: "Update communication preferences" })
    updatePreference(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdatePreferenceDto) {
        return this.authAccountService.updatePreference(user.id, dto);
    }

    // All sessions of current user
    @Get("sessions")
    @ApiOperation({ summary: "Get current authenticated user device sessions" })
    getSessions(@Req() req: any) {
        return this.authAccountService.getDeviceSessions(req.user.id, req.session.id);
    }
}
