import { PrismaService } from "@global/prisma/prisma.service";
import type { AuthenticatedUser } from "@main/auth/auth.types";
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { createHash } from "crypto";
import jwt from "jsonwebtoken";

@Injectable()
export class JwtAuthGuard implements CanActivate {
	constructor(prisma: PrismaService) {
		this.prisma = prisma;
	}

	private readonly prisma: PrismaService;

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const authorization = request.headers.authorization as string | undefined;

		if (authorization?.startsWith("Bearer ")) {
			const accessToken = authorization.slice(7).trim();
			try {
				const jwtSecret = process.env.JWT_SECRET || "change_this_secret";
				const payload = jwt.verify(accessToken, jwtSecret) as any;
				const userId = payload.sub as string;

				const user = await this.prisma.user.findUnique({
					where: { id: userId },
					select: {
						id: true,
						name: true,
						email: true,
						role: true,
						status: true,
						phoneNumber: true,
						addressLine1: true,
						addressLine2: true,
						city: true,
						state: true,
						zip: true,
					},
				});

				if (!user || user.status === "DISABLED") {
					throw new UnauthorizedException("Invalid user");
				}

				const authUser: AuthenticatedUser = {
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

				request.user = authUser;
				return true;
			} catch (error) {
				throw new UnauthorizedException("Invalid or expired access token");
			}
		}

		if (!authorization) {
			throw new UnauthorizedException("Missing access token");
		}

		const tokenHash = createHash("sha256").update(authorization).digest("hex");
		const session = await this.prisma.authSession.findFirst({
			where: {
				tokenHash,
				revokedAt: null,
				expiresAt: {
					gt: new Date(),
				},
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
						role: true,
						status: true,
						phoneNumber: true,
						addressLine1: true,
						addressLine2: true,
						city: true,
						state: true,
						zip: true,
					},
				},
			},
		});

		if (!session || session.user.status === "DISABLED") {
			throw new UnauthorizedException("Invalid or expired access token");
		}

		const user: AuthenticatedUser = {
			id: session.user.id,
			name: session.user.name,
			email: session.user.email,
			role: session.user.role,
			status: session.user.status,
			phoneNumber: session.user.phoneNumber,
			addressLine1: session.user.addressLine1,
			addressLine2: session.user.addressLine2,
			city: session.user.city,
			state: session.user.state,
			zip: session.user.zip,
		};

		request.user = user;
		request.session = session;
		return true;
	}
}
