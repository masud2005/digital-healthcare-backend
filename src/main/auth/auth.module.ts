import { PrismaModule } from "@global/prisma/prisma.module";
import { Module } from "@nestjs/common";
import { AuthRepository } from "./auth.repository";
import { AuthAccountController } from "./controllers/auth-account.controller";
import { AuthOtpController } from "./controllers/auth-otp.controller";
import { AuthPasswordController } from "./controllers/auth-password.controller";
import { AuthProfileController } from "./controllers/auth-profile.controller";
import { AuthSessionController } from "./controllers/auth-session.controller";
import { AuthAccountService } from "./services/auth-account.service";
import { AuthCleanupService } from "./services/auth-cleanup.service";
import { AuthEmailService } from "./services/auth-email.service";
import { AuthOtpService } from "./services/auth-otp.service";
import { AuthPasswordService } from "./services/auth-password.service";
import { AuthService } from "./services/auth.service";
import { AuthSessionService } from "./services/auth-session.service";
import { AuthSharedService } from "./services/auth-shared.service";

@Module({
    imports: [PrismaModule],
    controllers: [
        AuthAccountController,
        AuthOtpController,
        AuthPasswordController,
        AuthProfileController,
        AuthSessionController,
    ],
    providers: [
        AuthService,
        AuthRepository,
        AuthEmailService,
        AuthCleanupService,
        AuthSharedService,
        AuthAccountService,
        AuthOtpService,
        AuthPasswordService,
        AuthSessionService,
    ],
    exports: [AuthService],
})
export class AuthModule {}
