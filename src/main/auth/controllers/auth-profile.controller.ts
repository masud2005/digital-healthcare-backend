import { Body, Controller, Get, HttpStatus, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import type { AuthenticatedUser } from "../auth.types";
import { AuthProfileResponseDto } from "../dto/auth-response.dto";
import { UpdateProfileDto } from "../dto/update-profile.dto";
import { AuthAccountService } from "../services/auth-account.service";

@ApiTags("(Auth) Profile")
@Controller("auth")
export class AuthProfileController {
    constructor(private readonly authAccountService: AuthAccountService) {}

    @Get("me")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Get current authenticated user profile" })
    @ApiOkResponse({ type: AuthProfileResponseDto })
    getMe(@CurrentUser() user: AuthenticatedUser) {
        return this.authAccountService.getProfile(user.id);
    }

    @Patch("me")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Update current authenticated user profile (role-based)" })
    updateProfile(@CurrentUser() user: AuthenticatedUser, @Body() payload: UpdateProfileDto) {
        return this.authAccountService.updateProfile(user.id, payload);
    }
}
