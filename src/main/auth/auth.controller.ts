import { CurrentUser } from "@common/decorators";
import { JwtAuthGuard } from "@common/guards";
import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { AuthMessageResponseDto, AuthProfileResponseDto, AuthResponseDto } from "./dto/auth-response.dto";
import { RequestLoginOtpDto } from "./dto/request-login-otp.dto";
import { RequestRegisterOtpDto } from "./dto/request-register-otp.dto";
import { VerifyOtpDto } from "./dto/verify-otp.dto";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("register/request-otp")
    @ApiOperation({ summary: "Start registration and send OTP" })
    @ApiCreatedResponse({ type: AuthMessageResponseDto })
    requestRegisterOtp(@Body() payload: RequestRegisterOtpDto) {
        return this.authService.requestRegisterOtp(payload);
    }

    @Post("register/verify-otp")
    @ApiOperation({ summary: "Verify registration OTP" })
    @ApiCreatedResponse({ type: AuthResponseDto })
    async verifyRegisterOtp(@Body() payload: VerifyOtpDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.verifyOtp(payload.email, payload.otp, "REGISTER");
        // set httpOnly refresh cookie
        const cookieName = process.env.REFRESH_COOKIE_NAME || "token";
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.COOKIE_SECURE === "true",
            sameSite: process.env.COOKIE_SAMESITE ?? "Lax",
            path: "/",
            maxAge: Number(process.env.REFRESH_EXPIRES_DAYS ?? 30) * 24 * 60 * 60 * 1000,
        } as any;

        if (result.refreshToken) {
            res.cookie(cookieName, result.refreshToken, cookieOptions);
        }

        const { refreshToken, tokenType, ...responseBody } = result as any;
        return responseBody;
    }

    @Post("login/request-otp")
    @ApiOperation({ summary: "Start login and send OTP" })
    @ApiCreatedResponse({ type: AuthMessageResponseDto })
    requestLoginOtp(@Body() payload: RequestLoginOtpDto) {
        return this.authService.requestLoginOtp(payload);
    }

    @Post("login/verify-otp")
    @ApiOperation({ summary: "Verify login OTP" })
    @ApiCreatedResponse({ type: AuthResponseDto })
    async verifyLoginOtp(@Body() payload: VerifyOtpDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.verifyOtp(payload.email, payload.otp, "LOGIN");

        const cookieName = process.env.REFRESH_COOKIE_NAME || "token";
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.COOKIE_SECURE === "true",
            sameSite: process.env.COOKIE_SAMESITE ?? "Lax",
            path: "/",
            maxAge: Number(process.env.REFRESH_EXPIRES_DAYS ?? 30) * 24 * 60 * 60 * 1000,
        } as any;

        if (result.refreshToken) {
            res.cookie(cookieName, result.refreshToken, cookieOptions);
        }

        const { refreshToken, tokenType, ...responseBody } = result as any;
        return responseBody;
    }

    @Post("refresh")
    @ApiOperation({ summary: "Refresh access token using refresh token (cookie or body)" })
    async refresh(@Req() req: Request, @Body('refreshToken') refreshBodyToken?: string, @Res({ passthrough: true }) res?: Response) {
        const cookieName = process.env.REFRESH_COOKIE_NAME || "token";
        const token = refreshBodyToken || (req.cookies && req.cookies[cookieName]);

        const result = await this.authService.refresh(token);

        // set rotated refresh token cookie
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.COOKIE_SECURE === "true",
            sameSite: process.env.COOKIE_SAMESITE ?? "Lax",
            path: "/",
            maxAge: Number(process.env.REFRESH_EXPIRES_DAYS ?? 30) * 24 * 60 * 60 * 1000,
        } as any;

        if (res && result.refreshToken) {
            res.cookie(cookieName, result.refreshToken, cookieOptions);
        }

        const { refreshToken, ...responseBody } = result as any;
        return responseBody;
    }

    @Post("logout")
    @ApiOperation({ summary: "Logout and invalidate refresh token" })
    @ApiOkResponse({ type: AuthMessageResponseDto })
    async logout(@Req() req: Request, @Body('refreshToken') refreshBodyToken?: string, @Res({ passthrough: true }) res?: Response) {
        const cookieName = process.env.REFRESH_COOKIE_NAME || "token";
        const token = refreshBodyToken || (req.cookies && req.cookies[cookieName]);

        const result = await this.authService.logout(token);

        // clear cookie
        if (res) {
            res.clearCookie(cookieName, { path: "/" });
        }

        return result;
    }

    @Get("me")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOkResponse({ type: AuthProfileResponseDto })
    me(@CurrentUser() user: { id: string }) {
        return this.authService.getProfile(user.id);
    }

    // @Patch("profile")
    // @UseGuards(JwtAuthGuard)
    // @ApiBearerAuth()
    // @ApiOkResponse({ type: AuthProfileResponseDto })
    // updateProfile(@CurrentUser() user: { id: string }, @Body() payload: UpdateProfileDto) {
    //     return this.authService.updateProfile(user.id, payload);
    // }
}