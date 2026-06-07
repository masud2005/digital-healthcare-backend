import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { AuthRepository } from "../auth.repository";
import { ChangePasswordDto } from "../dto/change-password.dto";
import { ForgotPasswordDto } from "../dto/forgot-password.dto";
import { ResetPasswordDto } from "../dto/reset-password.dto";
import type { AuthRequestContext } from "./auth-context.type";
import { AuthSharedService } from "./auth-shared.service";

@Injectable()
export class AuthPasswordService {
    constructor(
        private readonly authRepository: AuthRepository,
        private readonly authSharedService: AuthSharedService,
    ) {}

    async forgotPassword(payload: ForgotPasswordDto) {
        const user = payload.email
            ? await this.authRepository.findUserByEmail(
                  this.authSharedService.normalizeEmail(payload.email),
              )
            : payload.phone
              ? await this.authRepository.findUserByPhone(
                    this.authSharedService.normalizePhone(payload.phone),
                )
              : null;

        if (!user) {
            return {
                success: true,
                message:
                    "If an account exists with the provided information, further instructions will be sent.",
                data: null,
            };
        }

        switch (user.status) {
            case "PENDING_VERIFICATION":
                throw new BadRequestException(
                    "Please verify your account before resetting your password.",
                );

            case "SUSPENDED":
                throw new ForbiddenException(
                    "Your account has been suspended. Please contact support.",
                );

            case "BLOCKED":
                throw new ForbiddenException(
                    "Your account has been blocked. Please contact support.",
                );

            case "DISABLED":
                throw new ForbiddenException(
                    "Your account has been disabled. Please contact support.",
                );

            case "DELETED":
                throw new NotFoundException("This account is no longer available.");

            case "ACTIVE":
                break;

            default:
                throw new ForbiddenException("Your account is currently unavailable.");
        }

        return {
            success: true,
            message: "Account found. Proceed to send OTP with purpose FORGOT_PASSWORD.",
            data: {
                userId: user.id,
            },
        };
    }

    async resetPassword(payload: ResetPasswordDto, context: AuthRequestContext) {
        if (payload.newPassword !== payload.confirmPassword) {
            throw new BadRequestException("newPassword and confirmPassword do not match");
        }

        const challenge = await this.authRepository.findOtpChallengeById(payload.challengeId);

        if (!challenge || challenge.purpose !== "FORGOT_PASSWORD") {
            throw new NotFoundException("OTP challenge not found");
        }

        if (challenge.status !== "VERIFIED" || !challenge.consumedAt) {
            throw new BadRequestException("OTP has not been verified");
        }

        const user = challenge.user ?? challenge.flowAttempt?.user;
        if (!user) {
            throw new NotFoundException("User not found");
        }

        await this.authRepository.updatePassword(
            user.id,
            this.authSharedService.hashPassword(payload.newPassword),
        );
        await this.authRepository.createSecurityEvent({
            type: "PASSWORD_RESET_COMPLETED",
            userId: user.id,
            flowAttemptId: challenge.flowAttemptId,
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
            deviceFingerprint: this.authSharedService.resolveDeviceFingerprint(context),
        });

        return { success: true, message: "Password reset successfully" };
    }

    async changePassword(userId: string, payload: ChangePasswordDto, context: AuthRequestContext) {
        if (payload.newPassword !== payload.confirmPassword) {
            throw new BadRequestException("newPassword and confirmPassword do not match");
        }

        const user = await this.authRepository.findUserById(userId);

        if (!user || !user.password) {
            throw new NotFoundException("User not found");
        }

        if (!this.authSharedService.verifyPassword(payload.currentPassword, user.password)) {
            throw new BadRequestException("Current password is incorrect");
        }

        await this.authRepository.updatePassword(
            user.id,
            this.authSharedService.hashPassword(payload.newPassword),
        );
        await this.authRepository.createSecurityEvent({
            type: "PASSWORD_CHANGED",
            userId: user.id,
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
            deviceFingerprint: this.authSharedService.resolveDeviceFingerprint(context),
        });

        return { success: true, message: "Password changed successfully" };
    }
}
