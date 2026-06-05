import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { AuthAttemptStatus, AuthSecurityEventType, OtpChannel, OtpPurpose, OtpStatus } from "@prisma/client";

const roleSelect = {
    role: {
        select: {
            id: true,
            name: true,
            displayName: true,
        },
    },
} as const;

const userSelect = {
    id: true,
    name: true,
    email: true,
    phone: true,
    password: true,
    status: true,
    emailVerifiedAt: true,
    phoneVerifiedAt: true,
    mfaEnabled: true,
    lastLoginAt: true,
    createdAt: true,
    userRoles: {
        select: roleSelect,
    },
} as const;

export type AuthUserRecord = Awaited<ReturnType<AuthRepository["findUserByEmail"]>>;

@Injectable()
export class AuthRepository {
    constructor(private readonly prisma: PrismaService) {}

    findUserByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
            select: userSelect,
        });
    }

    findUserByPhone(phone: string) {
        return this.prisma.user.findUnique({
            where: { phone },
            select: userSelect,
        });
    }

    findUserById(userId: string) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: userSelect,
        });
    }

    async createOrUpdatePendingUser(data: { userId?: string; name?: string | null; email: string; phone: string; password: string }) {
        const user = data.userId
            ? await this.prisma.user.update({
                  where: { id: data.userId },
                  data: {
                      name: data.name,
                      email: data.email,
                      phone: data.phone,
                      password: data.password,
                      status: "PENDING_VERIFICATION",
                  },
                  select: userSelect,
              })
            : await this.prisma.user.create({
                  data: {
                      name: data.name,
                      email: data.email,
                      phone: data.phone,
                      password: data.password,
                      status: "PENDING_VERIFICATION",
                  },
                  select: userSelect,
              });

        await this.assignRole(user.id, "PATIENT", true);
        return this.findUserById(user.id);
    }

    async assignRole(userId: string, roleName: string, isSystem = false) {
        const role = await this.prisma.role.upsert({
            where: { name: roleName },
            update: { isActive: true },
            create: {
                name: roleName,
                displayName: this.toDisplayName(roleName),
                isSystem,
            },
            select: { id: true },
        });

        await this.prisma.userRole.upsert({
            where: {
                userId_roleId: {
                    userId,
                    roleId: role.id,
                },
            },
            update: {},
            create: {
                userId,
                roleId: role.id,
            },
        });
    }

    activateUser(userId: string, verifiedChannel: OtpChannel) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                status: "ACTIVE",
                emailVerifiedAt: verifiedChannel === "EMAIL" ? new Date() : undefined,
                phoneVerifiedAt: verifiedChannel === "PHONE" ? new Date() : undefined,
            },
            select: userSelect,
        });
    }

    markLastLogin(userId: string) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { lastLoginAt: new Date() },
            select: userSelect,
        });
    }

    updatePassword(userId: string, password: string) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { password },
            select: userSelect,
        });
    }

    createFlowAttempt(data: {
        purpose: OtpPurpose;
        status?: AuthAttemptStatus;
        otpChannel?: OtpChannel | null;
        email?: string | null;
        phone?: string | null;
        userId?: string | null;
        ipAddress?: string | null;
        userAgent?: string | null;
        acceptLanguage?: string | null;
        deviceFingerprint?: string | null;
        deviceName?: string | null;
        expiresAt: Date;
        metadata?: Prisma.InputJsonValue;
    }) {
        return this.prisma.authFlowAttempt.create({
            data: {
                purpose: data.purpose,
                status: data.status ?? "STARTED",
                otpChannel: data.otpChannel,
                email: data.email,
                phone: data.phone,
                userId: data.userId,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
                acceptLanguage: data.acceptLanguage,
                deviceFingerprint: data.deviceFingerprint,
                deviceName: data.deviceName,
                expiresAt: data.expiresAt,
                metadata: data.metadata,
            },
        });
    }

    findFlowAttempt(id: string, purpose?: OtpPurpose) {
        return this.prisma.authFlowAttempt.findFirst({
            where: {
                id,
                purpose,
                deletedAt: null,
            },
            include: {
                user: {
                    select: userSelect,
                },
            },
        });
    }

    updateFlowAttemptStatus(id: string, data: { status: AuthAttemptStatus; failureReason?: string | null; verifiedAt?: Date | null }) {
        return this.prisma.authFlowAttempt.update({
            where: { id },
            data,
        });
    }

    createOtpChallenge(data: {
        flowAttemptId: string;
        userId?: string | null;
        purpose: OtpPurpose;
        channel: OtpChannel;
        recipient: string;
        codeHash: string;
        expiresAt: Date;
        ipAddress?: string | null;
        userAgent?: string | null;
    }) {
        return this.prisma.authOtpChallenge.create({
            data,
        });
    }

    findOtpChallengeById(challengeId: string) {
        return this.prisma.authOtpChallenge.findUnique({
            where: { id: challengeId },
            include: {
                flowAttempt: {
                    include: {
                        user: {
                            select: userSelect,
                        },
                    },
                },
                user: {
                    select: userSelect,
                },
            },
        });
    }

    findLatestOtpChallengeByUserPurpose(userId: string, purpose: OtpPurpose) {
        return this.prisma.authOtpChallenge.findFirst({
            where: {
                userId,
                purpose,
            },
            include: {
                flowAttempt: {
                    include: {
                        user: {
                            select: userSelect,
                        },
                    },
                },
                user: {
                    select: userSelect,
                },
            },
            orderBy: { createdAt: "desc" },
        });
    }

    findLatestOtpChallengeForAttempt(flowAttemptId: string) {
        return this.prisma.authOtpChallenge.findFirst({
            where: {
                flowAttemptId,
                consumedAt: null,
            },
            orderBy: { createdAt: "desc" },
        });
    }

    consumeOtpChallenge(challengeId: string) {
        return this.prisma.authOtpChallenge.update({
            where: { id: challengeId },
            data: {
                status: "VERIFIED",
                consumedAt: new Date(),
            },
        });
    }

    updateOtpChallengeStatus(challengeId: string, status: OtpStatus) {
        return this.prisma.authOtpChallenge.update({
            where: { id: challengeId },
            data: { status },
        });
    }

    incrementOtpAttempts(challengeId: string) {
        return this.prisma.authOtpChallenge.update({
            where: { id: challengeId },
            data: {
                attemptCount: { increment: 1 },
                status: "FAILED",
            },
        });
    }

    incrementOtpResend(challengeId: string) {
        return this.prisma.authOtpChallenge.update({
            where: { id: challengeId },
            data: {
                resendCount: { increment: 1 },
                lastSentAt: new Date(),
            },
        });
    }

    upsertDevice(data: {
        userId: string;
        fingerprintHash: string;
        name?: string | null;
        userAgent?: string | null;
        platform?: string | null;
        ipAddress?: string | null;
        country?: string | null;
        city?: string | null;
        metadata?: Prisma.InputJsonValue;
    }) {
        return this.prisma.authDevice.upsert({
            where: {
                userId_fingerprintHash: {
                    userId: data.userId,
                    fingerprintHash: data.fingerprintHash,
                },
            },
            update: {
                name: data.name,
                userAgent: data.userAgent,
                platform: data.platform,
                ipLastSeen: data.ipAddress,
                country: data.country,
                city: data.city,
                lastSeenAt: new Date(),
                metadata: data.metadata,
            },
            create: {
                userId: data.userId,
                fingerprintHash: data.fingerprintHash,
                name: data.name,
                userAgent: data.userAgent,
                platform: data.platform,
                ipFirstSeen: data.ipAddress,
                ipLastSeen: data.ipAddress,
                country: data.country,
                city: data.city,
                metadata: data.metadata,
            },
        });
    }

    createSession(data: {
        userId: string;
        tokenHash: string;
        refreshTokenHash: string;
        expiresAt: Date;
        flowAttemptId?: string | null;
        deviceId?: string | null;
        ipAddress?: string | null;
        userAgent?: string | null;
        deviceFingerprint?: string | null;
    }) {
        return this.prisma.authSession.create({
            data,
        });
    }

    updateSessionTokenHash(sessionId: string, tokenHash: string) {
        return this.prisma.authSession.update({
            where: { id: sessionId },
            data: { tokenHash },
        });
    }

    findActiveSessionById(sessionId: string) {
        return this.prisma.authSession.findFirst({
            where: {
                id: sessionId,
                revokedAt: null,
                expiresAt: { gt: new Date() },
            },
            include: {
                user: {
                    select: userSelect,
                },
            },
        });
    }

    revokeSessionById(sessionId: string, reason: string) {
        return this.prisma.authSession.updateMany({
            where: { id: sessionId, revokedAt: null },
            data: {
                revokedAt: new Date(),
                revokeReason: reason,
            },
        });
    }

    deleteOldOtpChallenges(cutoff: Date) {
        return this.prisma.authOtpChallenge.deleteMany({
            where: {
                OR: [{ expiresAt: { lt: cutoff } }, { consumedAt: { lt: cutoff } }],
            },
        });
    }

    createSecurityEvent(data: {
        type: AuthSecurityEventType;
        userId?: string | null;
        flowAttemptId?: string | null;
        sessionId?: string | null;
        ipAddress?: string | null;
        userAgent?: string | null;
        deviceFingerprint?: string | null;
        metadata?: Prisma.InputJsonValue;
    }) {
        return this.prisma.authSecurityEvent.create({
            data: data as Prisma.AuthSecurityEventUncheckedCreateInput,
        });
    }

    private toDisplayName(value: string) {
        return value
            .toLowerCase()
            .split("_")
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" ");
    }
}
