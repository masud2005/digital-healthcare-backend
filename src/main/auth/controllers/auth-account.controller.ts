import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import { AuthOtpResponseDto, AuthRegisterResponseDto } from "../dto/auth-response.dto";
import { LoginDto } from "../dto/login.dto";
import { RegisterDto } from "../dto/register.dto";
import { AuthAccountService } from "../services/auth-account.service";
import { AuthOtpService } from "../services/auth-otp.service";
import { getRequestContext } from "./auth-controller.utils";

@ApiTags("Auth")
@Controller("auth")
export class AuthAccountController {
    constructor(
        private readonly authAccountService: AuthAccountService,
        private readonly authOtpService: AuthOtpService,
    ) {}

    @Post("register")
    @ApiOperation({ summary: "Register user basic information" })
    @ApiCreatedResponse({ type: AuthRegisterResponseDto })
    register(@Body() payload: RegisterDto) {
        return this.authAccountService.register(payload);
    }

    @Post("login")
    @ApiOperation({ summary: "Verify login credentials and send login OTP" })
    @ApiOkResponse({ type: AuthOtpResponseDto })
    async login(@Body() payload: LoginDto, @Req() req: Request) {
        const result = await this.authAccountService.login(payload);
        return this.authOtpService.sendOtp(
            {
                userId: result.data.userId,
                purpose: "LOGIN",
                method: "EMAIL",
            },
            getRequestContext(req),
        );
    }
}
