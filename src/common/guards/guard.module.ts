import { PrismaModule } from "@global/prisma/prisma.module";
import { Global, Module } from "@nestjs/common";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { RolesGuard } from "./roles.guard";
import { PermissionsGuard } from "./permissions.guard";

@Global()
@Module({
    imports: [PrismaModule],
    providers: [JwtAuthGuard, RolesGuard, PermissionsGuard],
    exports: [JwtAuthGuard, RolesGuard, PermissionsGuard],
})
export class GuardModule {}
