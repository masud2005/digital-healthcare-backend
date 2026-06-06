import { Body, Controller, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthLoginResponseDto, AuthRegisterResponseDto } from "../dto/auth-response.dto";
import { LoginDto } from "../dto/login.dto";
import { RegisterDto } from "../dto/register.dto";
import { AuthAccountService } from "../services/auth-account.service";

@ApiTags("Auth")
@Controller("auth")
export class AuthAccountController {
    constructor(private readonly authAccountService: AuthAccountService) {}

    @Post("register")
    @ApiOperation({ summary: "Register user basic information" })
    @ApiCreatedResponse({ type: AuthRegisterResponseDto })
    register(@Body() payload: RegisterDto) {
        return this.authAccountService.register(payload);
    }

    @Post("login")
    @ApiOperation({ summary: "Verify login credentials before OTP" })
    @ApiOkResponse({ type: AuthLoginResponseDto })
    login(@Body() payload: LoginDto) {
        return this.authAccountService.login(payload);
    }
}
