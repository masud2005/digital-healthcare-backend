import { Injectable } from "@nestjs/common";
import type { AuthenticatedUser } from "../auth.types";
import { ChangePasswordDto } from "../dto/change-password.dto";
import { ForgotPasswordDto } from "../dto/forgot-password.dto";
import { LoginDto } from "../dto/login.dto";
import { RegisterDto } from "../dto/register.dto";
import { ResendOtpDto } from "../dto/resend-otp.dto";
import { ResetPasswordDto } from "../dto/reset-password.dto";
import { SendOtpDto } from "../dto/send-otp.dto";
import { VerifyOtpDto } from "../dto/verify-otp.dto";
import { AuthAccountService } from "./auth-account.service";
import type { AuthRequestContext } from "./auth-context.type";
import { AuthOtpService } from "./auth-otp.service";
import { AuthPasswordService } from "./auth-password.service";
import { AuthSessionService } from "./auth-session.service";

export type { AuthRequestContext } from "./auth-context.type";

@Injectable()
export class AuthService {
    constructor(
        private readonly authAccountService: AuthAccountService,
        private readonly authOtpService: AuthOtpService,
        private readonly authPasswordService: AuthPasswordService,
        private readonly authSessionService: AuthSessionService,
    ) {}

    register(payload: RegisterDto) {
        return this.authAccountService.register(payload);
    }

    login(payload: LoginDto) {
        return this.authAccountService.login(payload);
    }

    sendOtp(payload: SendOtpDto, context: AuthRequestContext) {
        return this.authOtpService.sendOtp(payload, context);
    }

    resendOtp(payload: ResendOtpDto, context: AuthRequestContext) {
        return this.authOtpService.resendOtp(payload, context);
    }

    verifyOtp(payload: VerifyOtpDto, context: AuthRequestContext) {
        return this.authOtpService.verifyOtp(payload, context);
    }

    verifyOtpAuto(challengeId: string, otp: string, context: AuthRequestContext = {}) {
        return this.authOtpService.verifyOtpAuto(challengeId, otp, context);
    }

    forgotPassword(payload: ForgotPasswordDto) {
        return this.authPasswordService.forgotPassword(payload);
    }

    resetPassword(payload: ResetPasswordDto, context: AuthRequestContext) {
        return this.authPasswordService.resetPassword(payload, context);
    }

    changePassword(userId: string, payload: ChangePasswordDto, context: AuthRequestContext) {
        return this.authPasswordService.changePassword(userId, payload, context);
    }

    logout(sessionId?: string | null) {
        return this.authSessionService.logout(sessionId);
    }

    getProfile(userId: string) {
        return this.authAccountService.getProfile(userId);
    }

    resolveUserFromAccessToken(
        accessToken: string,
    ): Promise<{ user: AuthenticatedUser; sessionId: string }> {
        return this.authSessionService.resolveUserFromAccessToken(accessToken);
    }
}
