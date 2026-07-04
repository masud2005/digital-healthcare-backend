import { PERMISSIONS_KEY } from "@common/decorators/permissions.decorator";
import type { AuthenticatedUser } from "@main/auth/auth.types";
import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // No permissions declared on this route — allow through
        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user as AuthenticatedUser | undefined;

        // User not attached — JWT guard didn't run or token is invalid
        if (!user) {
            throw new UnauthorizedException("Authentication required to access this resource.");
        }

        // System ADMIN role automatically bypasses all permission checks to avoid lockout
        if (user.roles.includes("ADMIN") || user.role === "ADMIN") {
            return true;
        }

        const userPermissions = user.permissions ?? [];

        // Find which required permissions the user is actually missing
        const missingPermissions = requiredPermissions.filter(
            (permission) => !userPermissions.includes(permission),
        );

        if (missingPermissions.length > 0) {
            throw new ForbiddenException(
                `Access denied. Your account does not have the required permission(s): ${missingPermissions.join(", ")}`,
            );
        }

        return true;
    }
}
