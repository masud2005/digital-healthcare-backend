import { PrismaModule } from "@global/prisma/prisma.module";
import { Global, Module } from "@nestjs/common";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { RolesGuard } from "./roles.guard";

@Global()
@Module({
	imports: [PrismaModule],
	providers: [JwtAuthGuard, RolesGuard],
	exports: [JwtAuthGuard, RolesGuard],
})
export class GuardModule {}