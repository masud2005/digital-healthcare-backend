import { Body, Controller, Post, Req, Res } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Request, Response } from "express";
import { AuthRequestContext, AuthService } from "./auth.service";
import { AuthLoginResponseDto, AuthOtpResponseDto, AuthRegisterResponseDto, AuthResponseDto } from "./dto/auth-response.dto";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { ResendOtpDto } from "./dto/resend-otp.dto";
import { SendOtpDto } from "./dto/send-otp.dto";
import { VerifyOtpDto } from "./dto/verify-otp.dto";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("register")
    @ApiOperation({ summary: "Register user basic information" })
    @ApiCreatedResponse({ type: AuthRegisterResponseDto })
    register(@Body() payload: RegisterDto) {
        return this.authService.register(payload);
    }

    @Post("login")
    @ApiOperation({ summary: "Verify login credentials before OTP" })
    @ApiOkResponse({ type: AuthLoginResponseDto })
    login(@Body() payload: LoginDto) {
        return this.authService.login(payload);
    }

    @Post("send-otp")
    @ApiOperation({ summary: "Send OTP by email or SMS" })
    @ApiCreatedResponse({ type: AuthOtpResponseDto })
    sendOtp(@Body() payload: SendOtpDto, @Req() req: Request) {
        return this.authService.sendOtp(payload, this.getRequestContext(req));
    }

    @Post("resend-otp")
    @ApiOperation({ summary: "Resend OTP by challenge id or latest user purpose challenge" })
    @ApiCreatedResponse({ type: AuthOtpResponseDto })
    resendOtp(@Body() payload: ResendOtpDto, @Req() req: Request) {
        return this.authService.resendOtp(payload, this.getRequestContext(req));
    }

    @Post("verify-otp")
    @ApiOperation({ summary: "Verify OTP and complete register/login flow" })
    @ApiOkResponse({ type: AuthResponseDto })
    async verifyOtp(@Body() payload: VerifyOtpDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.verifyOtp(payload, this.getRequestContext(req));
        return this.setRefreshCookieAndReturnBody(result, res);
    }

    private setRefreshCookieAndReturnBody(result: { refreshToken: string; [key: string]: unknown }, res: Response) {
        res.cookie(this.refreshCookieName, result.refreshToken, {
            httpOnly: true,
            secure: process.env.COOKIE_SECURE === "true",
            sameSite: process.env.COOKIE_SAMESITE ?? "Lax",
            path: "/",
            maxAge: Number(process.env.REFRESH_EXPIRES_DAYS ?? 30) * 24 * 60 * 60 * 1000,
        } as any);

        const { refreshToken, ...responseBody } = result;
        return responseBody;
    }

    private get refreshCookieName() {
        return process.env.REFRESH_COOKIE_NAME || "refreshToken";
    }

    private getRequestContext(req: Request): AuthRequestContext {
        const forwardedFor = req.headers["x-forwarded-for"];
        const ipAddress = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(",")[0]?.trim();

        return {
            ipAddress: ipAddress || req.ip || req.socket.remoteAddress,
            userAgent: this.headerValue(req, "user-agent"),
            acceptLanguage: this.headerValue(req, "accept-language"),
            deviceFingerprint: this.headerValue(req, "x-device-fingerprint"),
            deviceName: this.headerValue(req, "x-device-name"),
            platform: this.headerValue(req, "x-device-platform"),
        };
    }

    private headerValue(req: Request, key: string) {
        const value = req.headers[key];
        return Array.isArray(value) ? value[0] : value ?? null;
    }
}
