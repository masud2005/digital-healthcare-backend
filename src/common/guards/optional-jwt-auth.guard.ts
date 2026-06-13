import { PrismaService } from "@global/prisma/prisma.service";
import type { AuthenticatedUser } from "@main/auth/auth.types";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import jwt from "jsonwebtoken";

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
    constructor(private readonly prisma: PrismaService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authorization = request.headers.authorization as string | undefined;

        if (!authorization?.startsWith("Bearer ")) {
            return true;
        }

        const accessToken = authorization.slice(7).trim();

        try {
            const jwtSecret = process.env.JWT_SECRET || "change_this_secret";
            const payload = jwt.verify(accessToken, jwtSecret) as { sub?: string; sid?: string };

            if (!payload.sub || !payload.sid) {
                return true;
            }

            const session = await this.prisma.authSession.findFirst({
                where: {
                    id: payload.sid,
                    revokedAt: null,
                    expiresAt: { gt: new Date() },
                    userId: payload.sub,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            phone: true,
                            status: true,
                            userRoles: {
                                select: {
                                    role: {
                                        select: {
                                            name: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });

            if (session && session.user.status === "ACTIVE") {
                const roles = session.user.userRoles.map((userRole) => userRole.role.name);
                const user: AuthenticatedUser = {
                    id: session.user.id,
                    email: session.user.email,
                    phone: session.user.phone,
                    roles,
                    role: roles[0] ?? "PATIENT",
                    status: session.user.status,
                };

                request.user = user;
                request.session = session;
            }
        } catch {
            // Silently swallow validation errors to allow public access
        }

        return true;
    }
}
