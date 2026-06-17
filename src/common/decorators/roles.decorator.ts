import type { AppRole } from "@common/auth/roles.constants";
import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "roles";
export const Roles = (...roles: AppRole[]) => SetMetadata(ROLES_KEY, roles);
