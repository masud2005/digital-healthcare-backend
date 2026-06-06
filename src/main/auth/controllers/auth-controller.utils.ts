import type { Request, Response } from "express";
import type { AuthRequestContext } from "../services/auth-context.type";

export function getRequestContext(req: Request): AuthRequestContext {
    const forwardedFor = req.headers["x-forwarded-for"];
    const ipAddress = Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor?.split(",")[0]?.trim();

    return {
        ipAddress: ipAddress || req.ip || req.socket.remoteAddress,
        userAgent: headerValue(req, "user-agent"),
        acceptLanguage: headerValue(req, "accept-language"),
        deviceFingerprint: headerValue(req, "x-device-fingerprint"),
        deviceName: headerValue(req, "x-device-name"),
        platform: headerValue(req, "x-device-platform"),
    };
}

export function setRefreshCookieAndReturnBody(
    result: { refreshToken: string; [key: string]: unknown },
    res: Response,
) {
    res.cookie(refreshCookieName(), result.refreshToken, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === "true",
        sameSite: process.env.COOKIE_SAMESITE ?? "Lax",
        path: "/",
        maxAge: Number(process.env.REFRESH_EXPIRES_DAYS ?? 30) * 24 * 60 * 60 * 1000,
    } as any);

    const { refreshToken, ...responseBody } = result;
    return responseBody;
}

export function clearRefreshCookie(res: Response) {
    res.clearCookie(refreshCookieName(), {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === "true",
        sameSite: process.env.COOKIE_SAMESITE ?? "Lax",
        path: "/",
    } as any);
}

function refreshCookieName() {
    return process.env.REFRESH_COOKIE_NAME || "refreshToken";
}

function headerValue(req: Request, key: string) {
    const value = req.headers[key];
    return Array.isArray(value) ? value[0] : (value ?? null);
}
