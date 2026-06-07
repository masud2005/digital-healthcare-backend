import { Body, Controller, Post, Req, Res } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Request, Response } from "express";
import { AuthOtpResponseDto, AuthResponseDto } from "../dto/auth-response.dto";
import { ResendOtpDto } from "../dto/resend-otp.dto";
import { SendOtpDto } from "../dto/send-otp.dto";
import { VerifyOtpDto } from "../dto/verify-otp.dto";
import { AuthOtpService } from "../services/auth-otp.service";
import { getRequestContext, setRefreshCookieAndReturnBody } from "./auth-controller.utils";

@ApiTags("Auth")
@Controller("auth")
export class AuthOtpController {
    constructor(private readonly authOtpService: AuthOtpService) {}

    @Post("send-otp")
    @ApiOperation({ summary: "Send OTP by email or SMS" })
    @ApiCreatedResponse({ type: AuthOtpResponseDto })
    sendOtp(@Body() payload: SendOtpDto, @Req() req: Request) {
        return this.authOtpService.sendOtp(payload, getRequestContext(req));
    }

    @Post("resend-otp")
    @ApiOperation({ summary: "Resend OTP by challenge id or latest user purpose challenge" })
    @ApiCreatedResponse({ type: AuthOtpResponseDto })
    resendOtp(@Body() payload: ResendOtpDto, @Req() req: Request) {
        return this.authOtpService.resendOtp(payload, getRequestContext(req));
    }

    @Post("verify-otp")
    @ApiOperation({ summary: "Verify OTP and complete register/login flow" })
    @ApiOkResponse({ type: AuthResponseDto })
    async verifyOtp(
        @Body() payload: VerifyOtpDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const result = await this.authOtpService.verifyOtp(payload, getRequestContext(req));
        if (!result.refreshToken) {
            return result;
        }

        return setRefreshCookieAndReturnBody(
            result as { refreshToken: string; [key: string]: unknown },
            res,
        );
    }
}
