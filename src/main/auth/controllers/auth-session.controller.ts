import { Controller, Post, Req, Res, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Request, Response } from "express";
import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import { AuthMessageResponseDto } from "../dto/auth-response.dto";
import { AuthSessionService } from "../services/auth-session.service";
import { clearRefreshCookie } from "./auth-controller.utils";

type AuthenticatedRequest = Request & {
    session?: {
        id: string;
    };
};

@ApiTags("(Auth) Session")
@Controller("auth")
export class AuthSessionController {
    constructor(private readonly authSessionService: AuthSessionService) {}

    @Post("logout")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Logout current authenticated session" })
    @ApiOkResponse({ type: AuthMessageResponseDto })
    async logout(@Req() req: AuthenticatedRequest, @Res({ passthrough: true }) res: Response) {
        const result = await this.authSessionService.logout(req.session?.id);
        clearRefreshCookie(res);
        return result;
    }
}
