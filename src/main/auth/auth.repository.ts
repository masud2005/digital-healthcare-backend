import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { OtpPurpose } from "@prisma/client";

const userSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    status: true,
    passwordHash: true,
    phoneNumber: true,
    addressLine1: true,
    addressLine2: true,
    city: true,
    state: true,
    zip: true,
    emailVerifiedAt: true,
    lastLoginAt: true,
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

    findUserById(userId: string) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: userSelect,
        });
    }

    createPendingUser(data: { name: string; email: string; passwordHash: string }) {
        return this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                passwordHash: data.passwordHash,
                status: "PENDING",
            },
            select: userSelect,
        });
    }

    updatePendingUser(userId: string, data: { passwordHash?: string }) {
        return this.prisma.user.update({
            where: { id: userId },
            data,
            select: userSelect,
        });
    }

    activateUser(userId: string) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                status: "ACTIVE",
                emailVerifiedAt: new Date(),
            },
            select: userSelect,
        });
    }

    updateProfile(
        userId: string,
        data: { phoneNumber?: string | null; addressLine1?: string | null; addressLine2?: string | null; city?: string | null; state?: string | null; zip?: string | null },
    ) {
        return this.prisma.user.update({
            where: { id: userId },
            data,
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

    createOtpChallenge(data: { email: string; purpose: OtpPurpose; codeHash: string; userId?: string | null; expiresAt: Date }) {
        return this.prisma.authOtpChallenge.create({
            data,
        });
    }

    findLatestOtpChallenge(email: string, purpose: OtpPurpose) {
        return this.prisma.authOtpChallenge.findFirst({
            where: {
                email,
                purpose,
                consumedAt: null,
                expiresAt: {
                    gt: new Date(),
                },
            },
            orderBy: { createdAt: "desc" },
        });
    }

    findLatestOtpChallengeForEmail(email: string) {
        return this.prisma.authOtpChallenge.findFirst({
            where: {
                email,
                consumedAt: null,
                expiresAt: {
                    gt: new Date(),
                },
            },
            orderBy: { createdAt: "desc" },
        });
    }

    consumeOtpChallenge(challengeId: string) {
        return this.prisma.authOtpChallenge.update({
            where: { id: challengeId },
            data: {
                consumedAt: new Date(),
            },
        });
    }

    incrementOtpAttempts(challengeId: string) {
        return this.prisma.authOtpChallenge.update({
            where: { id: challengeId },
            data: {
                attemptCount: { increment: 1 },
            },
        });
    }

    /**
     * Remove previous challenges for the same email and purpose.
     * This keeps only the latest challenge per (email,purpose) and avoids table growth.
     */
    deleteChallengesForEmailPurpose(email: string, purpose: OtpPurpose) {
        return this.prisma.authOtpChallenge.deleteMany({
            where: { email, purpose },
        });
    }

    /**
     * Prune OTP challenges that are expired or already consumed before the cutoff date.
     */
    deleteOldOtpChallenges(cutoff: Date) {
        return this.prisma.authOtpChallenge.deleteMany({
            where: {
                OR: [
                    { expiresAt: { lt: cutoff } },
                    { consumedAt: { lt: cutoff } },
                ],
            },
        });
    }

    createSession(userId: string, tokenHash: string, expiresAt: Date) {
        return this.prisma.authSession.create({
            data: {
                userId,
                tokenHash,
                expiresAt,
            },
        });
    }

    findSessionByTokenHash(tokenHash: string) {
        return this.prisma.authSession.findFirst({
            where: {
                tokenHash,
                revokedAt: null,
                expiresAt: {
                    gt: new Date(),
                },
            },
            include: {
                user: {
                    select: userSelect,
                },
            },
        });
    }

    revokeSession(tokenHash: string) {
        return this.prisma.authSession.updateMany({
            where: { tokenHash, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }
}