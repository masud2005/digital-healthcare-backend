import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { createHash, pbkdf2Sync, randomBytes, randomInt, timingSafeEqual } from "crypto";
import jwt from "jsonwebtoken";
import { AuthEmailService } from "./auth-email.service";
import { AuthRepository } from "./auth.repository";
import type { AuthenticatedUser } from "./auth.types";
import { RequestLoginOtpDto } from "./dto/request-login-otp.dto";
import { RequestRegisterOtpDto } from "./dto/request-register-otp.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";

const OTP_EXPIRY_MINUTES = 10;
const SESSION_EXPIRY_DAYS = 30;
const PASSWORD_ITERATIONS = 120000;

@Injectable()
export class AuthService {
    constructor(
        private readonly authRepository: AuthRepository,
        private readonly authEmailService: AuthEmailService,
    ) {}

    async requestRegisterOtp(payload: RequestRegisterOtpDto) {
        const email = this.normalizeEmail(payload.email);
        const password = payload.password.trim();
        const confirmPassword = payload.confirmPassword.trim();

        if (password !== confirmPassword) {
            throw new BadRequestException("Password and confirm password do not match");
        }

        const existingUser = await this.authRepository.findUserByEmail(email);

        if (existingUser?.status === "ACTIVE") {
            throw new ConflictException("Account already exists");
        }

        const passwordHash = this.hashPassword(password);
        const displayName = this.deriveDisplayName(email);
        const user = existingUser
            ? await this.authRepository.updatePendingUser(existingUser.id, {
                  passwordHash,
              })
            : await this.authRepository.createPendingUser({
                  name: displayName,
                  email,
                  passwordHash,
              });

        const otp = this.generateOtp();
        const codeHash = this.hashOtp(user.email, otp);

        // remove previous challenges for this email/purpose to avoid table growth
        await this.authRepository.deleteChallengesForEmailPurpose(user.email, "REGISTER");

        await this.authRepository.createOtpChallenge({
            email: user.email,
            purpose: "REGISTER",
            codeHash,
            userId: user.id,
            expiresAt: this.expiresAtMinutes(OTP_EXPIRY_MINUTES),
        });

        await this.authEmailService.sendOtpEmail(user.email, user.name, otp, "REGISTER");

        return {
            message: "Registration OTP sent successfully",
        };
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

    async requestLoginOtp(payload: RequestLoginOtpDto) {
        const email = this.normalizeEmail(payload.email);
        const user = await this.authRepository.findUserByEmail(email);

        if (!user || !user.passwordHash) {
            throw new NotFoundException("Account not found");
        }

        if (user.status !== "ACTIVE") {
            throw new BadRequestException("Account is not active");
        }

        if (!this.verifyPassword(payload.password, user.passwordHash)) {
            throw new UnauthorizedException("Invalid credentials");
        }

        const otp = this.generateOtp();
        const codeHash = this.hashOtp(user.email, otp);

        // remove previous challenges for this email/purpose to avoid table growth
        await this.authRepository.deleteChallengesForEmailPurpose(user.email, "LOGIN");

        await this.authRepository.createOtpChallenge({
            email: user.email,
            purpose: "LOGIN",
            codeHash,
            userId: user.id,
            expiresAt: this.expiresAtMinutes(OTP_EXPIRY_MINUTES),
        });

        await this.authEmailService.sendOtpEmail(user.email, user.name, otp, "LOGIN");

        return {
            message: "Login OTP sent successfully",
        };
    }

    async verifyOtpAuto(emailInput: string, otpInput: string) {
        const email = this.normalizeEmail(emailInput);
        
        // Find latest OTP challenge without purpose filter
        const challenge = await this.authRepository.findLatestOtpChallengeForEmail(email);
        
        if (!challenge) {
            throw new NotFoundException("OTP challenge not found");
        }

        // Auto-detect purpose from the challenge
        const purpose = challenge.purpose as "REGISTER" | "LOGIN";

        // Call the original verifyOtp with detected purpose
        return this.verifyOtp(email, otpInput, purpose);
    }

    async verifyOtp(emailInput: string, otpInput: string, purpose: "REGISTER" | "LOGIN") {
        const email = this.normalizeEmail(emailInput);
        const challenge = await this.authRepository.findLatestOtpChallenge(email, purpose);

        if (!challenge) {
            throw new NotFoundException("OTP challenge not found");
        }

        if (challenge.expiresAt < new Date()) {
            throw new BadRequestException("OTP has expired");
        }

        if (challenge.consumedAt) {
            throw new BadRequestException("OTP already used");
        }

        if (challenge.attemptCount >= 5) {
            throw new BadRequestException("Too many OTP attempts");
        }

        const submittedHash = this.hashOtp(email, otpInput);
        const expected = Buffer.from(challenge.codeHash, "hex");
        const submitted = Buffer.from(submittedHash, "hex");

        if (expected.length !== submitted.length || !timingSafeEqual(expected, submitted)) {
            await this.authRepository.incrementOtpAttempts(challenge.id);
            throw new BadRequestException("Invalid OTP");
        }

        await this.authRepository.consumeOtpChallenge(challenge.id);

        const user = challenge.userId
            ? await this.authRepository.findUserById(challenge.userId)
            : await this.authRepository.findUserByEmail(email);

        if (!user) {
            throw new NotFoundException("User not found");
        }

        if (purpose === "REGISTER") {
            await this.authRepository.activateUser(user.id);
        }

        const refreshedUser = await this.authRepository.markLastLogin(user.id);

        // Create JWT access token (short lived)
        const jwtSecret = process.env.JWT_SECRET || "change_this_secret";
        const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "15m";

        const accessToken = jwt.sign({ sub: refreshedUser.id, email: refreshedUser.email }, jwtSecret, {
            expiresIn: jwtExpiresIn,
        });

        // Create refresh token (opaque) and store hashed
        const refreshRaw = randomBytes(48).toString("hex");
        const refreshHash = this.hashValue(refreshRaw);
        const refreshExpiresDays = Number(process.env.REFRESH_EXPIRES_DAYS ?? 30);

        await this.authRepository.createSession(refreshedUser.id, refreshHash, this.expiresAtDays(refreshExpiresDays));

        return {
            accessToken,
            tokenType: "Bearer",
            refreshToken: refreshRaw,
            user: this.mapUser(refreshedUser),
            profileComplete: this.isProfileComplete(refreshedUser),
        };
    }

    async refresh(refreshToken: string) {
        if (!refreshToken) {
            throw new UnauthorizedException("Missing refresh token");
        }

        const refreshHash = this.hashValue(refreshToken);
        const session = await this.authRepository.findSessionByTokenHash(refreshHash);

        if (!session) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        if (session.revokedAt) {
            throw new UnauthorizedException("Refresh token revoked");
        }

        if (session.expiresAt < new Date()) {
            throw new UnauthorizedException("Refresh token expired");
        }

        // rotate: revoke old session and create a new one
        await this.authRepository.revokeSession(refreshHash);

        const user = session.user;
        const jwtSecret = process.env.JWT_SECRET || "change_this_secret";
        const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "15m";

        const accessToken = jwt.sign({ sub: user.id, email: user.email }, jwtSecret, {
            expiresIn: jwtExpiresIn,
        });

        const newRefreshRaw = randomBytes(48).toString("hex");
        const newRefreshHash = this.hashValue(newRefreshRaw);
        const refreshExpiresDays = Number(process.env.REFRESH_EXPIRES_DAYS ?? 30);

        await this.authRepository.createSession(user.id, newRefreshHash, this.expiresAtDays(refreshExpiresDays));

        return {
            accessToken,
            tokenType: "Bearer",
            refreshToken: newRefreshRaw,
            user: this.mapUser(user),
            profileComplete: this.isProfileComplete(user),
        };
    }

    async getProfile(userId: string) {
        const user = await this.authRepository.findUserById(userId);

        if (!user) {
            throw new NotFoundException("User not found");
        }

        return {
            user: this.mapUser(user),
            profileComplete: this.isProfileComplete(user),
        };
    }

    async updateProfile(userId: string, payload: UpdateProfileDto) {
        const user = await this.authRepository.updateProfile(userId, {
            phoneNumber: this.normalizeOptional(payload.phoneNumber),
            addressLine1: this.normalizeOptional(payload.addressLine1),
            addressLine2: this.normalizeOptional(payload.addressLine2),
            city: this.normalizeOptional(payload.city),
            state: this.normalizeOptional(payload.state),
            zip: this.normalizeOptional(payload.zip),
        });

        return {
            user: this.mapUser(user),
            profileComplete: this.isProfileComplete(user),
        };
    }

    async logout(accessToken: string) {
        if (!accessToken) {
            throw new UnauthorizedException("Missing refresh token");
        }

        const hash = this.hashValue(accessToken);
        await this.authRepository.revokeSession(hash);

        return {
            message: "Logged out successfully",
        };
    }

    async resolveUserFromAccessToken(accessToken: string): Promise<AuthenticatedUser> {
        if (!accessToken) {
            throw new UnauthorizedException("Missing access token");
        }

        try {
            const jwtSecret = process.env.JWT_SECRET || "change_this_secret";
            const payload = jwt.verify(accessToken, jwtSecret) as any;
            const userId = payload.sub as string;

            const user = await this.authRepository.findUserById(userId);

            if (!user || user.status === "DISABLED") {
                throw new UnauthorizedException("Invalid user");
            }

            return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                phoneNumber: user.phoneNumber,
                addressLine1: user.addressLine1,
                addressLine2: user.addressLine2,
                city: user.city,
                state: user.state,
                zip: user.zip,
            };
        } catch {
            throw new UnauthorizedException("Invalid or expired access token");
        }
    }

    private generateOtp() {
        return String(randomInt(100000, 1000000));
    }

    private generateAccessToken() {
        return randomBytes(32).toString("hex");
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

    private normalizeOptional(value?: string | null) {
        const normalized = value?.trim();
        return normalized ? normalized : null;
    }

    private hashValue(value: string) {
        return createHash("sha256").update(value).digest("hex");
    }

    private hashOtp(email: string, otp: string) {
        return this.hashValue(`${email}:${otp}`);
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
        return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(derived, "hex"));
    }

    private mapUser(user: Awaited<ReturnType<AuthRepository["findUserById"]>>) {
        if (!user) {
            throw new NotFoundException("User not found");
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            phoneNumber: user.phoneNumber,
            addressLine1: user.addressLine1,
            addressLine2: user.addressLine2,
            city: user.city,
            state: user.state,
            zip: user.zip,
        };
    }

    private isProfileComplete(user: Awaited<ReturnType<AuthRepository["findUserById"]>>) {
        return Boolean(user?.phoneNumber && user?.addressLine1 && user?.city && user?.state && user?.zip);
    }
}