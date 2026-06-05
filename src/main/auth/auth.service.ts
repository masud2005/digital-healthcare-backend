import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import type { AuthSecurityEventType, OtpChannel, OtpPurpose } from "@prisma/client";
import { createHash, pbkdf2Sync, randomBytes, randomInt, timingSafeEqual } from "crypto";
import jwt from "jsonwebtoken";
import { AuthEmailService } from "./auth-email.service";
import { AuthRepository } from "./auth.repository";
import type { AuthenticatedUser } from "./auth.types";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { ResendOtpDto } from "./dto/resend-otp.dto";
import { SendOtpDto } from "./dto/send-otp.dto";
import { VerifyOtpDto } from "./dto/verify-otp.dto";

const OTP_EXPIRY_MINUTES = 10;
const FLOW_EXPIRY_MINUTES = 15;
const PASSWORD_ITERATIONS = 120000;
const MAX_OTP_ATTEMPTS = 5;

export type AuthRequestContext = {
    ipAddress?: string | null;
    userAgent?: string | null;
    acceptLanguage?: string | null;
    deviceFingerprint?: string | null;
    deviceName?: string | null;
    platform?: string | null;
};

type PublicOtpMethod = "EMAIL" | "SMS";

@Injectable()
export class AuthService {
    constructor(
        private readonly authRepository: AuthRepository,
        private readonly authEmailService: AuthEmailService,
    ) {}

    async register(payload: RegisterDto) {
        const email = this.normalizeEmail(payload.email);
        const phone = this.normalizePhone(payload.phone);
        const password = payload.password.trim();
        const confirmPassword = payload.confirmPassword.trim();

        if (password !== confirmPassword) {
            throw new BadRequestException("Password and confirm password do not match");
        }

        const existingByEmail = await this.authRepository.findUserByEmail(email);
        if (existingByEmail?.status === "ACTIVE") {
            throw new ConflictException("Account already exists with this email");
        }

        const existingByPhone = await this.authRepository.findUserByPhone(phone);
        if (existingByPhone && existingByPhone.id !== existingByEmail?.id) {
            throw new ConflictException("Account already exists with this phone");
        }

        const user = await this.authRepository.createOrUpdatePendingUser({
            userId: existingByEmail?.id,
            name: this.normalizeOptional(payload.name) ?? this.deriveDisplayName(email),
            email,
            phone,
            password: this.hashPassword(password),
        });

        if (!user) {
            throw new NotFoundException("User not found");
        }

        return {
            success: true,
            message: "Registration initiated",
            data: {
                userId: user.id,
                status: user.status,
            },
        };
    }

    async login(payload: LoginDto) {
        const email = this.normalizeEmail(payload.email);
        const user = await this.authRepository.findUserByEmail(email);

        if (!user || !user.password) {
            throw new UnauthorizedException("Invalid credentials");
        }

        if (user.status !== "ACTIVE") {
            throw new BadRequestException("Account is not active");
        }

        if (!this.verifyPassword(payload.password, user.password)) {
            throw new UnauthorizedException("Invalid credentials");
        }

        return {
            success: true,
            message: "Login credentials verified",
            data: {
                userId: user.id,
                status: "OTP_REQUIRED",
            },
        };
    }

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
            deviceFingerprint: this.resolveDeviceFingerprint(context),
            deviceName: context.deviceName,
            expiresAt: this.expiresAtMinutes(FLOW_EXPIRY_MINUTES),
        });

        await this.authRepository.createSecurityEvent({
            type: payload.purpose === "LOGIN" ? "LOGIN_STARTED" : "REGISTER_STARTED",
            userId: user.id,
            flowAttemptId: attempt.id,
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
            deviceFingerprint: this.resolveDeviceFingerprint(context),
        });

        const challenge = await this.issueOtp({
            flowAttemptId: attempt.id,
            purpose: payload.purpose,
            channel,
            userId: user.id,
            email: user.email,
            phone: user.phone,
            displayName: user.name ?? this.deriveDisplayName(user.email),
            context,
        });

        return this.toOtpResponse("OTP sent successfully", challenge.id, user.id, payload.purpose, method, challenge.expiresAt);
    }

    async resendOtp(payload: ResendOtpDto, context: AuthRequestContext) {
        const previousChallenge = payload.challengeId
            ? await this.authRepository.findOtpChallengeById(payload.challengeId)
            : payload.userId && payload.purpose
              ? await this.authRepository.findLatestOtpChallengeByUserPurpose(payload.userId, payload.purpose)
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
                      deviceFingerprint: this.resolveDeviceFingerprint(context),
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
            displayName: user.name ?? this.deriveDisplayName(user.email),
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

        const submittedHash = this.hashOtp(challenge.flowAttemptId, challenge.recipient, payload.otp);
        if (!this.safeCompareHex(challenge.codeHash, submittedHash)) {
            await this.authRepository.incrementOtpAttempts(challenge.id);
            await this.logOtpEvent("OTP_VERIFY_FAILED", challenge.userId, challenge.flowAttemptId, context);
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

        const auth = await this.createAuthenticatedResponse(authenticatedUser, challenge.flowAttemptId, context);
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

    async logout(sessionId?: string | null) {
        if (!sessionId) {
            throw new UnauthorizedException("Missing session");
        }

        await this.authRepository.revokeSessionById(sessionId, "LOGOUT");

        return {
            success: true,
            message: "Logged out successfully",
        };
    }

    async getProfile(userId: string) {
        const user = await this.authRepository.findUserById(userId);

        if (!user) {
            throw new NotFoundException("User not found");
        }

        return {
            success: true,
            message: "Profile fetched successfully",
            data: this.mapUser(user),
        };
    }

    async verifyOtpAuto(challengeId: string, otp: string, context: AuthRequestContext = {}) {
        return this.verifyOtp({ challengeId, otp }, context);
    }

    async resolveUserFromAccessToken(accessToken: string): Promise<{ user: AuthenticatedUser; sessionId: string }> {
        if (!accessToken) {
            throw new UnauthorizedException("Missing access token");
        }

        try {
            const jwtSecret = process.env.JWT_SECRET || "change_this_secret";
            const payload = jwt.verify(accessToken, jwtSecret) as { sub?: string; sid?: string };

            if (!payload.sub || !payload.sid) {
                throw new UnauthorizedException("Invalid access token");
            }

            const session = await this.authRepository.findActiveSessionById(payload.sid);

            if (!session || session.user.id !== payload.sub || session.user.status !== "ACTIVE") {
                throw new UnauthorizedException("Invalid session");
            }

            return {
                user: this.mapAuthenticatedUser(session.user),
                sessionId: session.id,
            };
        } catch {
            throw new UnauthorizedException("Invalid or expired access token");
        }
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
        const codeHash = this.hashOtp(input.flowAttemptId, recipient, otp);

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

        await this.authRepository.updateFlowAttemptStatus(input.flowAttemptId, { status: "OTP_SENT" });

        if (input.channel === "EMAIL") {
            await this.authEmailService.sendOtpEmail(recipient, input.displayName, otp, input.purpose);
        } else {
            await this.authEmailService.sendOtpPhone(recipient, otp, input.purpose);
        }

        await this.authRepository.createSecurityEvent({
            type: input.eventType ?? "OTP_SENT",
            userId: input.userId,
            flowAttemptId: input.flowAttemptId,
            ipAddress: input.context.ipAddress,
            userAgent: input.context.userAgent,
            deviceFingerprint: this.resolveDeviceFingerprint(input.context),
            metadata: {
                method: this.toPublicMethod(input.channel),
                recipient: this.maskRecipient(input.channel, recipient),
            },
        });

        return challenge;
    }

    private async createAuthenticatedResponse(user: NonNullable<Awaited<ReturnType<AuthRepository["findUserById"]>>>, flowAttemptId: string, context: AuthRequestContext) {
        const refreshRaw = randomBytes(48).toString("hex");
        const refreshHash = this.hashValue(refreshRaw);
        const sessionSecretHash = this.hashValue(randomBytes(48).toString("hex"));
        const refreshExpiresDays = Number(process.env.REFRESH_EXPIRES_DAYS ?? 30);
        const fingerprint = this.resolveDeviceFingerprint(context);
        const device = await this.authRepository.upsertDevice({
            userId: user.id,
            fingerprintHash: fingerprint,
            name: context.deviceName,
            userAgent: context.userAgent,
            platform: context.platform,
            ipAddress: context.ipAddress,
        });
        const session = await this.authRepository.createSession({
            userId: user.id,
            tokenHash: sessionSecretHash,
            refreshTokenHash: refreshHash,
            expiresAt: this.expiresAtDays(refreshExpiresDays),
            flowAttemptId,
            deviceId: device.id,
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
            deviceFingerprint: fingerprint,
        });
        const jwtSecret = process.env.JWT_SECRET || "change_this_secret";
        const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "15m";
        const accessToken = jwt.sign({ sub: user.id, sid: session.id, email: user.email }, jwtSecret, {
            expiresIn: jwtExpiresIn,
        });

        await this.authRepository.updateSessionTokenHash(session.id, this.hashValue(accessToken));
        await this.authRepository.createSecurityEvent({
            type: "SESSION_CREATED",
            userId: user.id,
            flowAttemptId,
            sessionId: session.id,
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
            deviceFingerprint: fingerprint,
        });

        return {
            accessToken,
            tokenType: "Bearer",
            refreshToken: refreshRaw,
            user: this.mapUser(user),
        };
    }

    private assertUserCanReceiveOtp(status: string, purpose: OtpPurpose) {
        if (purpose === "REGISTER" && status !== "PENDING_VERIFICATION") {
            throw new BadRequestException(status === "ACTIVE" ? "Account is already verified" : "Account is not eligible for registration OTP");
        }

        if (purpose === "LOGIN" && status !== "ACTIVE") {
            throw new BadRequestException("Account is not active");
        }
    }

    private toOtpResponse(message: string, challengeId: string, userId: string, purpose: OtpPurpose, method: PublicOtpMethod, expiresAt: Date) {
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

    private async logOtpEvent(type: AuthSecurityEventType, userId: string | null, flowAttemptId: string, context: AuthRequestContext) {
        await this.authRepository.createSecurityEvent({
            type,
            userId,
            flowAttemptId,
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
            deviceFingerprint: this.resolveDeviceFingerprint(context),
        });
    }

    private generateOtp() {
        return String(randomInt(100000, 1000000));
    }

    private expiresAtMinutes(minutes: number) {
        return new Date(Date.now() + minutes * 60 * 1000);
    }

    private expiresAtDays(days: number) {
        return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }

    private normalizeEmail(email: string) {
        return email.trim().toLowerCase();
    }

    private normalizePhone(phone: string) {
        const normalized = phone.trim().replace(/[^\d+]/g, "");

        if (!normalized) {
            throw new BadRequestException("Phone number is required");
        }

        return normalized;
    }

    private normalizeOptional(value?: string | null) {
        const normalized = value?.trim();
        return normalized ? normalized : null;
    }

    private deriveDisplayName(email: string) {
        const localPart = email.split("@")[0]?.trim();

        if (!localPart) {
            return "User";
        }

        return localPart
            .replace(/[._-]+/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .replace(/\b\w/g, (char) => char.toUpperCase());
    }

    private hashValue(value: string) {
        return createHash("sha256").update(value).digest("hex");
    }

    private hashOtp(flowAttemptId: string, recipient: string, otp: string) {
        return this.hashValue(`${flowAttemptId}:${recipient}:${otp}`);
    }

    private hashPassword(password: string) {
        const salt = randomBytes(16).toString("hex");
        const derived = pbkdf2Sync(password, salt, PASSWORD_ITERATIONS, 32, "sha256").toString("hex");
        return `${salt}:${derived}`;
    }

    private verifyPassword(password: string, storedHash: string) {
        const [salt, hash] = storedHash.split(":");

        if (!salt || !hash) {
            return false;
        }

        const derived = pbkdf2Sync(password, salt, PASSWORD_ITERATIONS, 32, "sha256").toString("hex");
        return this.safeCompareHex(hash, derived);
    }

    private safeCompareHex(expectedHex: string, submittedHex: string) {
        const expected = Buffer.from(expectedHex, "hex");
        const submitted = Buffer.from(submittedHex, "hex");
        return expected.length === submitted.length && timingSafeEqual(expected, submitted);
    }

    private resolveDeviceFingerprint(context: AuthRequestContext) {
        if (context.deviceFingerprint) {
            return this.hashValue(context.deviceFingerprint);
        }

        return this.hashValue([context.userAgent ?? "unknown", context.ipAddress ?? "unknown", context.platform ?? "unknown"].join(":"));
    }

    private maskRecipient(channel: OtpChannel, recipient: string) {
        if (channel === "EMAIL") {
            const [localPart, domain] = recipient.split("@");
            return `${localPart?.slice(0, 2) ?? "**"}***@${domain ?? "***"}`;
        }

        return `${recipient.slice(0, 4)}***${recipient.slice(-2)}`;
    }

    private mapUser(user: NonNullable<Awaited<ReturnType<AuthRepository["findUserById"]>>>) {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            status: user.status,
            emailVerifiedAt: user.emailVerifiedAt,
            phoneVerifiedAt: user.phoneVerifiedAt,
            mfaEnabled: user.mfaEnabled,
            lastLoginAt: user.lastLoginAt,
            roles: user.userRoles.map((userRole) => userRole.role.name),
        };
    }

    private mapAuthenticatedUser(user: NonNullable<Awaited<ReturnType<AuthRepository["findUserById"]>>>): AuthenticatedUser {
        const roles = user.userRoles.map((userRole) => userRole.role.name);

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            roles,
            role: roles[0] ?? "PATIENT",
            status: user.status,
        };
    }
}
