import type { AppRole } from "@common/auth/roles.constants";
import { ROLES_KEY } from "@common/decorators/roles.decorator";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<AppRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const userRoles = (request.user?.roles ??
            [request.user?.role].filter(Boolean)) as AppRole[];

        if (userRoles.length === 0) {
            return false;
        }

        return requiredRoles.some((role) => userRoles.includes(role));
    }
}
