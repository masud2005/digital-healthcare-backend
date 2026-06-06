import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import type { AuthenticatedUser } from "../auth.types";
import { AuthMessageResponseDto, AuthOtpResponseDto } from "../dto/auth-response.dto";
import { ChangePasswordDto } from "../dto/change-password.dto";
import { ForgotPasswordDto } from "../dto/forgot-password.dto";
import { ResetPasswordDto } from "../dto/reset-password.dto";
import { AuthPasswordService } from "../services/auth-password.service";
import { getRequestContext } from "./auth-controller.utils";

@ApiTags("Auth")
@Controller("auth")
export class AuthPasswordController {
    constructor(private readonly authPasswordService: AuthPasswordService) {}

    @Post("forgot-password")
    @ApiOperation({ summary: "Validate account by email or phone to initiate password reset" })
    @ApiBody({
        schema: {
            oneOf: [
                {
                    type: "object",
                    required: ["email"],
                    properties: {
                        email: { type: "string", format: "email", example: "user@gmail.com" },
                    },
                },
                {
                    type: "object",
                    required: ["phone"],
                    properties: {
                        phone: { type: "string", example: "+88017xxxxxxxx" },
                    },
                },
            ],
        },
        examples: {
            email: {
                summary: "Using email",
                value: { email: "user@gmail.com" },
            },
            phone: {
                summary: "Using phone",
                value: { phone: "+88017xxxxxxxx" },
            },
        },
    })
    @ApiOkResponse({ type: AuthOtpResponseDto })
    forgotPassword(@Body() payload: ForgotPasswordDto) {
        return this.authPasswordService.forgotPassword(payload);
    }

    @Post("reset-password")
    @ApiOperation({ summary: "Reset password using OTP from forgot-password flow" })
    @ApiOkResponse({ type: AuthMessageResponseDto })
    resetPassword(@Body() payload: ResetPasswordDto, @Req() req: Request) {
        return this.authPasswordService.resetPassword(payload, getRequestContext(req));
    }

    @Post("change-password")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Change password for authenticated user" })
    @ApiOkResponse({ type: AuthMessageResponseDto })
    changePassword(
        @Body() payload: ChangePasswordDto,
        @CurrentUser() user: AuthenticatedUser,
        @Req() req: Request,
    ) {
        return this.authPasswordService.changePassword(user.id, payload, getRequestContext(req));
    }
}
