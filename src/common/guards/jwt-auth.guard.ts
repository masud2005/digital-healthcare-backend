import { PrismaService } from "@global/prisma/prisma.service";
import type { AuthenticatedUser } from "@main/auth/auth.types";
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import jwt from "jsonwebtoken";

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private readonly prisma: PrismaService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authorization = request.headers.authorization as string | undefined;

        if (!authorization?.startsWith("Bearer ")) {
            throw new UnauthorizedException("Missing access token");
        }

        const accessToken = authorization.slice(7).trim();

        try {
            const jwtSecret = process.env.JWT_SECRET || "change_this_secret";
            const payload = jwt.verify(accessToken, jwtSecret) as { sub?: string; sid?: string };

            if (!payload.sub || !payload.sid) {
                throw new UnauthorizedException("Invalid access token");
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
                                            permissions: {
                                                select: {
                                                    permission: { select: { key: true } },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            userPermissions: {
                                select: {
                                    permission: { select: { key: true } },
                                },
                            },
                        },
                    },
                },
            });

            if (!session || session.user.status !== "ACTIVE") {
                throw new UnauthorizedException("Invalid session");
            }

            const roles = session.user.userRoles.map((userRole) => userRole.role.name);

            // Collect permissions from all assigned roles
            const rolePermissions = session.user.userRoles.flatMap((ur) =>
                ur.role.permissions.map((rp) => rp.permission.key),
            );

            // Collect permissions assigned directly to the user
            const directPermissions = session.user.userPermissions.map(
                (up) => up.permission.key,
            );

            // Merge and deduplicate
            const permissions = [...new Set([...rolePermissions, ...directPermissions])];

            const user: AuthenticatedUser = {
                id: session.user.id,
                email: session.user.email,
                phone: session.user.phone,
                roles,
                role: roles[0] ?? "PATIENT",
                permissions,
                status: session.user.status,
            };

            request.user = user;
            request.session = session;
            return true;
        } catch {
            throw new UnauthorizedException("Invalid or expired access token");
        }
    }
}
