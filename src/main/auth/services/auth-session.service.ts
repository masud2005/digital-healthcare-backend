import { Injectable, UnauthorizedException } from "@nestjs/common";
import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import { AuditLogService } from "../../(compliance)/audit-log/audit-log.service";
import { AuthRepository } from "../auth.repository";
import type { AuthenticatedUser } from "../auth.types";
import type { AuthRequestContext } from "./auth-context.type";
import { AuthSharedService } from "./auth-shared.service";

type AuthUser = NonNullable<Awaited<ReturnType<AuthRepository["findUserById"]>>>;

@Injectable()
export class AuthSessionService {
    constructor(
        private readonly authRepository: AuthRepository,
        private readonly authSharedService: AuthSharedService,
        private readonly auditLogService: AuditLogService,
    ) {}

    async createAuthenticatedResponse(
        user: AuthUser,
        flowAttemptId: string | undefined | null,
        context: AuthRequestContext,
    ) {
        const refreshRaw = randomBytes(48).toString("hex");
        const refreshHash = this.authSharedService.hashValue(refreshRaw);
        const sessionSecretHash = this.authSharedService.hashValue(randomBytes(48).toString("hex"));
        const refreshExpiresDays = Number(process.env.REFRESH_EXPIRES_DAYS ?? 30);
        const fingerprint = this.authSharedService.resolveDeviceFingerprint(context);
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
        const accessToken = jwt.sign(
            { sub: user.id, sid: session.id, email: user.email },
            jwtSecret,
            {
                expiresIn: jwtExpiresIn,
            },
        );

        await this.authRepository.updateSessionTokenHash(
            session.id,
            this.authSharedService.hashValue(accessToken),
        );
        await this.authRepository.createSecurityEvent({
            type: "SESSION_CREATED",
            userId: user.id,
            flowAttemptId,
            sessionId: session.id,
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
            deviceFingerprint: fingerprint,
        });

        // Audit log: successful login
        const userRole = user.userRoles?.[0]?.role?.name ?? "Patient";
        this.auditLogService
            .createLog({
                userId: user.id,
                userName: user.email,
                userRole,
                activityType: "Login",
                event: `User logged in successfully`,
                ipAddress: context.ipAddress ?? undefined,
                status: "SUCCESS",
            })
            .catch(() => {});

        return {
            accessToken,
            tokenType: "Bearer",
            refreshToken: refreshRaw,
            user: this.authSharedService.mapUser(user),
        };
    }

    async logout(sessionId?: string | null) {
        if (!sessionId) {
            throw new UnauthorizedException("Missing session");
        }

        const session = await this.authRepository
            .findActiveSessionById(sessionId)
            .catch(() => null);

        await this.authRepository.revokeSessionById(sessionId, "LOGOUT");

        // Audit log: logout
        if (session?.user) {
            const userRole = session.user.userRoles?.[0]?.role?.name ?? "Patient";
            this.auditLogService
                .createLog({
                    userId: session.user.id,
                    userName: session.user.email,
                    userRole,
                    activityType: "Login",
                    event: "User logged out",
                    ipAddress: session.ipAddress ?? undefined,
                    status: "SUCCESS",
                })
                .catch(() => {});
        }

        return {
            success: true,
            message: "Logged out successfully",
        };
    }

    async refresh(refreshToken: string, context: AuthRequestContext) {
        if (!refreshToken) {
            throw new UnauthorizedException("Missing refresh token");
        }

        const refreshHash = this.authSharedService.hashValue(refreshToken);
        const session = await this.authRepository.findActiveSessionByRefreshTokenHash(refreshHash);

        if (!session || session.user.status !== "ACTIVE") {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        // Revoke the old session to prevent reuse
        await this.authRepository.revokeSessionById(session.id, "ROTATED");

        // Create a new session
        const auth = await this.createAuthenticatedResponse(
            session.user,
            session.flowAttemptId ?? null,
            context,
        );

        return {
            success: true,
            message: "Token refreshed successfully",
            data: {
                accessToken: auth.accessToken,
                tokenType: auth.tokenType,
                user: auth.user,
            },
            refreshToken: auth.refreshToken,
        };
    }

    async resolveUserFromAccessToken(
        accessToken: string,
    ): Promise<{ user: AuthenticatedUser; sessionId: string }> {
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
                user: this.authSharedService.mapAuthenticatedUser(session.user),
                sessionId: session.id,
            };
        } catch {
            throw new UnauthorizedException("Invalid or expired access token");
        }
    }

    private expiresAtDays(days: number) {
        return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }
}
