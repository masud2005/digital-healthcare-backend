import { PrismaModule } from "@global/prisma/prisma.module";
import { Module } from "@nestjs/common";
import { AuthCleanupService } from "./auth-cleanup.service";
import { AuthEmailService } from "./auth-email.service";
import { AuthController } from "./auth.controller";
import { AuthRepository } from "./auth.repository";
import { AuthService } from "./auth.service";

@Module({
    imports: [PrismaModule],
    controllers: [AuthController],
    providers: [AuthService, AuthRepository, AuthEmailService, AuthCleanupService],
    exports: [AuthService],
})
export class AuthModule {}