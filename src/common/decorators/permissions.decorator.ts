import { AppPermissionType } from "@common/auth/permissions.constants";
import { SetMetadata } from "@nestjs/common";

export const PERMISSIONS_KEY = "permissions";
export const RequirePermissions = (...permissions: AppPermissionType[]) => SetMetadata(PERMISSIONS_KEY, permissions);
