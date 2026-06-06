import { BadRequestException, Injectable } from "@nestjs/common";
import type { OtpChannel } from "@prisma/client";
import { createHash, pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";
import { AuthRepository } from "../auth.repository";
import type { AuthenticatedUser } from "../auth.types";
import type { AuthRequestContext } from "./auth-context.type";

const PASSWORD_ITERATIONS = 120000;

type AuthUser = NonNullable<Awaited<ReturnType<AuthRepository["findUserById"]>>>;

@Injectable()
export class AuthSharedService {
    hashValue(value: string) {
        return createHash("sha256").update(value).digest("hex");
    }

    hashOtp(flowAttemptId: string, recipient: string, otp: string) {
        return this.hashValue(`${flowAttemptId}:${recipient}:${otp}`);
    }

    hashPassword(password: string) {
        const salt = randomBytes(16).toString("hex");
        const derived = pbkdf2Sync(password, salt, PASSWORD_ITERATIONS, 32, "sha256").toString(
            "hex",
        );
        return `${salt}:${derived}`;
    }

    verifyPassword(password: string, storedHash: string) {
        const [salt, hash] = storedHash.split(":");

        if (!salt || !hash) {
            return false;
        }

        const derived = pbkdf2Sync(password, salt, PASSWORD_ITERATIONS, 32, "sha256").toString(
            "hex",
        );
        return this.safeCompareHex(hash, derived);
    }

    safeCompareHex(expectedHex: string, submittedHex: string) {
        const expected = Buffer.from(expectedHex, "hex");
        const submitted = Buffer.from(submittedHex, "hex");
        return expected.length === submitted.length && timingSafeEqual(expected, submitted);
    }

    resolveDeviceFingerprint(context: AuthRequestContext) {
        if (context.deviceFingerprint) {
            return this.hashValue(context.deviceFingerprint);
        }

        return this.hashValue(
            [
                context.userAgent ?? "unknown",
                context.ipAddress ?? "unknown",
                context.platform ?? "unknown",
            ].join(":"),
        );
    }

    normalizeEmail(email: string) {
        return email.trim().toLowerCase();
    }

    normalizePhone(phone: string) {
        const normalized = phone.trim().replace(/[^\d+]/g, "");

        if (!normalized) {
            throw new BadRequestException("Phone number is required");
        }

        return normalized;
    }

    deriveDisplayName(email: string) {
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

    maskRecipient(channel: OtpChannel, recipient: string) {
        if (channel === "EMAIL") {
            const [localPart, domain] = recipient.split("@");
            return `${localPart?.slice(0, 2) ?? "**"}***@${domain ?? "***"}`;
        }

        return `${recipient.slice(0, 4)}***${recipient.slice(-2)}`;
    }

    mapUser(user: AuthUser) {
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

    mapAuthenticatedUser(user: AuthUser): AuthenticatedUser {
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
