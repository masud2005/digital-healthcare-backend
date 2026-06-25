import { Body, Controller, Post, Req, Res } from "@nestjs/common";
import { ApiCreatedResponse, ApiExtraModels, ApiOkResponse, ApiOperation, ApiTags, getSchemaPath } from "@nestjs/swagger";
import type { Request, Response } from "express";
import { AuthLoginResponseDto, AuthOtpResponseDto, AuthRegisterResponseDto, AuthResponseDto } from "../dto/auth-response.dto";
import { LoginDto } from "../dto/login.dto";
import { RegisterDto } from "../dto/register.dto";
import { getRequestContext, setRefreshCookieAndReturnBody } from "./auth-controller.utils";
import { AuthAccountService } from "../services/auth-account.service";
import { AuthOtpService } from "../services/auth-otp.service";

@ApiTags("(Auth) Account")
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
    @ApiExtraModels(AuthLoginResponseDto, AuthResponseDto)
    @ApiOperation({ summary: "Verify login credentials and send login OTP or direct login" })
    @ApiOkResponse({
        description: "Returns OTP challenge if MFA is enabled, or Auth tokens if MFA is disabled",
        schema: {
            oneOf: [
                { $ref: getSchemaPath(AuthLoginResponseDto) },
                { $ref: getSchemaPath(AuthResponseDto) },
            ],
        },
    })
    async login(@Body() payload: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const result = await this.authAccountService.login(payload, getRequestContext(req));
        if (result.refreshToken) {
            return setRefreshCookieAndReturnBody(
                result as { refreshToken: string; [key: string]: unknown },
                res,
            );
        }
        return result;
    }
}
