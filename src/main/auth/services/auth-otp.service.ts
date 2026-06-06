import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { AuthSecurityEventType, OtpChannel, OtpPurpose } from "@prisma/client";
import { randomInt } from "crypto";
import { AuthRepository } from "../auth.repository";
import { ResendOtpDto } from "../dto/resend-otp.dto";
import { SendOtpDto } from "../dto/send-otp.dto";
import { VerifyOtpDto } from "../dto/verify-otp.dto";
import type { AuthRequestContext } from "./auth-context.type";
import { AuthEmailService } from "./auth-email.service";
import { AuthSessionService } from "./auth-session.service";
import { AuthSharedService } from "./auth-shared.service";

const OTP_EXPIRY_MINUTES = 10;
const FLOW_EXPIRY_MINUTES = 15;
const MAX_OTP_ATTEMPTS = 5;

type PublicOtpMethod = "EMAIL" | "SMS";

@Injectable()
export class AuthOtpService {
    constructor(
        private readonly authRepository: AuthRepository,
        private readonly authEmailService: AuthEmailService,
        private readonly authSessionService: AuthSessionService,
        private readonly authSharedService: AuthSharedService,
    ) {}

    async sendOtp(payload: SendOtpDto, context: AuthRequestContext) {
        const method = payload.method;
        const channel = this.toOtpChannel(method);
        const user = await this.authRepository.findUserById(payload.userId);

        if (!user) {
            throw new NotFoundException("User not found");
        }

        this.assertUserCanReceiveOtp(user.status, payload.purpose);

        if (channel === "PHONE" && !user.phone) {
            throw new BadRequestException("Phone number is not available for this account");
        }

        const attempt = await this.authRepository.createFlowAttempt({
            purpose: payload.purpose,
            status: "STARTED",
            otpChannel: channel,
            email: user.email,
            phone: user.phone,
            userId: user.id,
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
            acceptLanguage: context.acceptLanguage,
            deviceFingerprint: this.authSharedService.resolveDeviceFingerprint(context),
            deviceName: context.deviceName,
            expiresAt: this.expiresAtMinutes(FLOW_EXPIRY_MINUTES),
        });

        await this.authRepository.createSecurityEvent({
            type: payload.purpose === "LOGIN" ? "LOGIN_STARTED" : "REGISTER_STARTED",
            userId: user.id,
            flowAttemptId: attempt.id,
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
            deviceFingerprint: this.authSharedService.resolveDeviceFingerprint(context),
        });

        const challenge = await this.issueOtp({
            flowAttemptId: attempt.id,
            purpose: payload.purpose,
            channel,
            userId: user.id,
            email: user.email,
            phone: user.phone,
            displayName: user.name ?? this.authSharedService.deriveDisplayName(user.email),
            context,
        });

        return this.toOtpResponse(
            "OTP sent successfully",
            challenge.id,
            user.id,
            payload.purpose,
            method,
            challenge.expiresAt,
        );
    }

    async resendOtp(payload: ResendOtpDto, context: AuthRequestContext) {
        const previousChallenge = payload.challengeId
            ? await this.authRepository.findOtpChallengeById(payload.challengeId)
            : payload.userId && payload.purpose
              ? await this.authRepository.findLatestOtpChallengeByUserPurpose(
                    payload.userId,
                    payload.purpose,
                )
              : null;

        if (!previousChallenge) {
            throw new NotFoundException("OTP challenge not found");
        }

        const user = previousChallenge.user ?? previousChallenge.flowAttempt?.user;

        if (!user) {
            throw new NotFoundException("User not found");
        }

        this.assertUserCanReceiveOtp(user.status, previousChallenge.purpose);

        const activeAttempt =
            previousChallenge.flowAttempt && previousChallenge.flowAttempt.expiresAt > new Date()
                ? previousChallenge.flowAttempt
                : await this.authRepository.createFlowAttempt({
                      purpose: previousChallenge.purpose,
                      status: "STARTED",
                      otpChannel: previousChallenge.channel,
                      email: user.email,
                      phone: user.phone,
                      userId: user.id,
                      ipAddress: context.ipAddress,
                      userAgent: context.userAgent,
                      acceptLanguage: context.acceptLanguage,
                      deviceFingerprint: this.authSharedService.resolveDeviceFingerprint(context),
                      deviceName: context.deviceName,
                      expiresAt: this.expiresAtMinutes(FLOW_EXPIRY_MINUTES),
                  });

        await this.authRepository.incrementOtpResend(previousChallenge.id);

        const challenge = await this.issueOtp({
            flowAttemptId: activeAttempt.id,
            purpose: previousChallenge.purpose,
            channel: previousChallenge.channel,
            userId: user.id,
            email: user.email,
            phone: user.phone,
            displayName: user.name ?? this.authSharedService.deriveDisplayName(user.email),
            context,
            eventType: "OTP_RESENT",
        });

        return this.toOtpResponse(
            "OTP resent successfully",
            challenge.id,
            user.id,
            previousChallenge.purpose,
            this.toPublicMethod(previousChallenge.channel),
            challenge.expiresAt,
        );
    }

    async verifyOtp(payload: VerifyOtpDto, context: AuthRequestContext) {
        const challenge = await this.authRepository.findOtpChallengeById(payload.challengeId);

        if (!challenge) {
            throw new NotFoundException("OTP challenge not found");
        }

        if (!challenge.flowAttemptId || !challenge.flowAttempt) {
            throw new BadRequestException("OTP challenge is not linked to an auth flow");
        }

        if (challenge.consumedAt || challenge.status === "VERIFIED") {
            throw new BadRequestException("OTP already used");
        }

        if (challenge.expiresAt < new Date()) {
            await this.authRepository.updateOtpChallengeStatus(challenge.id, "EXPIRED");
            throw new BadRequestException("OTP has expired");
        }

        if (challenge.flowAttempt.expiresAt < new Date()) {
            await this.authRepository.updateFlowAttemptStatus(challenge.flowAttempt.id, {
                status: "EXPIRED",
                failureReason: "Flow attempt expired",
            });
            throw new BadRequestException("OTP attempt expired");
        }

        if (challenge.attemptCount >= MAX_OTP_ATTEMPTS) {
            await this.authRepository.updateFlowAttemptStatus(challenge.flowAttempt.id, {
                status: "FAILED",
                failureReason: "Too many OTP attempts",
            });
            throw new BadRequestException("Too many OTP attempts");
        }

        const submittedHash = this.authSharedService.hashOtp(
            challenge.flowAttemptId,
            challenge.recipient,
            payload.otp,
        );
        if (!this.authSharedService.safeCompareHex(challenge.codeHash, submittedHash)) {
            await this.authRepository.incrementOtpAttempts(challenge.id);
            await this.logOtpEvent(
                "OTP_VERIFY_FAILED",
                challenge.userId,
                challenge.flowAttemptId,
                context,
            );
            throw new BadRequestException("Invalid OTP");
        }

        await this.authRepository.consumeOtpChallenge(challenge.id);
        await this.authRepository.updateFlowAttemptStatus(challenge.flowAttemptId, {
            status: "VERIFIED",
            verifiedAt: new Date(),
        });
        await this.logOtpEvent("OTP_VERIFIED", challenge.userId, challenge.flowAttemptId, context);

        const user = challenge.user ?? challenge.flowAttempt.user;

        if (!user) {
            throw new NotFoundException("User not found");
        }

        const authenticatedUser =
            challenge.purpose === "REGISTER"
                ? await this.authRepository.activateUser(user.id, challenge.channel)
                : await this.authRepository.markLastLogin(user.id);

        if (challenge.purpose === "REGISTER") {
            await this.authRepository.assignRole(user.id, "PATIENT", true);
        }

        if (challenge.purpose === "FORGOT_PASSWORD") {
            return {
                success: true,
                message: "OTP verified. Proceed to reset your password using the challengeId",
                data: { challengeId: challenge.id },
            };
        }

        const auth = await this.authSessionService.createAuthenticatedResponse(
            authenticatedUser,
            challenge.flowAttemptId,
            context,
        );
        return {
            success: true,
            message: "OTP verified successfully",
            data: {
                accessToken: auth.accessToken,
                tokenType: auth.tokenType,
                user: auth.user,
            },
            refreshToken: auth.refreshToken,
        };
    }

    async verifyOtpAuto(challengeId: string, otp: string, context: AuthRequestContext = {}) {
        return this.verifyOtp({ challengeId, otp }, context);
    }

    private async issueOtp(input: {
        flowAttemptId: string;
        purpose: OtpPurpose;
        channel: OtpChannel;
        userId: string;
        email: string;
        phone?: string | null;
        displayName: string;
        context: AuthRequestContext;
        eventType?: AuthSecurityEventType;
    }) {
        const recipient = this.getOtpRecipient(input.channel, input.email, input.phone);
        const otp = this.generateOtp();
        const expiresAt = this.expiresAtMinutes(OTP_EXPIRY_MINUTES);
        const codeHash = this.authSharedService.hashOtp(input.flowAttemptId, recipient, otp);

        const challenge = await this.authRepository.createOtpChallenge({
            flowAttemptId: input.flowAttemptId,
            userId: input.userId,
            purpose: input.purpose,
            channel: input.channel,
            recipient,
            codeHash,
            expiresAt,
            ipAddress: input.context.ipAddress,
            userAgent: input.context.userAgent,
        });

        await this.authRepository.updateFlowAttemptStatus(input.flowAttemptId, {
            status: "OTP_SENT",
        });

        if (input.channel === "EMAIL") {
            await this.authEmailService.sendOtpEmail(
                recipient,
                input.displayName,
                otp,
                input.purpose,
            );
        } else {
            await this.authEmailService.sendOtpPhone(recipient, otp, input.purpose);
        }

        await this.authRepository.createSecurityEvent({
            type: input.eventType ?? "OTP_SENT",
            userId: input.userId,
            flowAttemptId: input.flowAttemptId,
            ipAddress: input.context.ipAddress,
            userAgent: input.context.userAgent,
            deviceFingerprint: this.authSharedService.resolveDeviceFingerprint(input.context),
            metadata: {
                method: this.toPublicMethod(input.channel),
                recipient: this.authSharedService.maskRecipient(input.channel, recipient),
            },
        });

        return challenge;
    }

    private assertUserCanReceiveOtp(status: string, purpose: OtpPurpose) {
        if (purpose === "REGISTER" && status !== "PENDING_VERIFICATION") {
            throw new BadRequestException(
                status === "ACTIVE"
                    ? "Account is already verified"
                    : "Account is not eligible for registration OTP",
            );
        }

        if (purpose === "LOGIN" && status !== "ACTIVE") {
            throw new BadRequestException("Account is not active");
        }

        if (purpose === "FORGOT_PASSWORD" && status !== "ACTIVE") {
            throw new BadRequestException("Account is not active");
        }
    }

    private toOtpResponse(
        message: string,
        challengeId: string,
        userId: string,
        purpose: OtpPurpose,
        method: PublicOtpMethod,
        expiresAt: Date,
    ) {
        return {
            success: true,
            message,
            data: {
                challengeId,
                userId,
                purpose,
                method,
                expiresAt,
            },
        };
    }

    private toOtpChannel(method: PublicOtpMethod): OtpChannel {
        return method === "SMS" ? "PHONE" : "EMAIL";
    }

    private toPublicMethod(channel: OtpChannel): PublicOtpMethod {
        return channel === "PHONE" ? "SMS" : "EMAIL";
    }

    private getOtpRecipient(channel: OtpChannel, email: string, phone?: string | null) {
        if (channel === "EMAIL") {
            return email;
        }

        if (!phone) {
            throw new BadRequestException("Phone number is required for SMS OTP");
        }

        return phone;
    }

    private async logOtpEvent(
        type: AuthSecurityEventType,
        userId: string | null,
        flowAttemptId: string,
        context: AuthRequestContext,
    ) {
        await this.authRepository.createSecurityEvent({
            type,
            userId,
            flowAttemptId,
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
            deviceFingerprint: this.authSharedService.resolveDeviceFingerprint(context),
        });
    }

    private generateOtp() {
        return String(randomInt(100000, 1000000));
    }

    private expiresAtMinutes(minutes: number) {
        return new Date(Date.now() + minutes * 60 * 1000);
    }
}
