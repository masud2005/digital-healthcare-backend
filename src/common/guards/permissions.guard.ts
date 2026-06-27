import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY } from "@common/decorators/permissions.decorator";
import type { AuthenticatedUser } from "@main/auth/auth.types";

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user as AuthenticatedUser | undefined;

        if (!user) {
            return false;
        }

        // System ADMIN role automatically bypasses all permission checks to avoid lockout
        if (user.roles.includes("ADMIN") || user.role === "ADMIN") {
            return true;
        }

        const userPermissions = user.permissions ?? [];

        // Check if the user has ALL of the required permissions
        return requiredPermissions.every((permission) => userPermissions.includes(permission));
    }
}
