import { MailModule } from "@global/mail/mail.module";
import { PrismaModule } from "@global/prisma/prisma.module";
import { StorageModule } from "@global/storage/storage.module";
import { SystemHealthModule } from "@main/(compliance)/system-healthar/system-health.module";
import { Module } from "@nestjs/common";
import { AuditLogModule } from "../(compliance)/audit-log/audit-log.module";
import { NotificationModule } from "../notification/notification.module";
import { ConsentModule } from "../(compliance)/consent/consent.module";
import { AuthRepository } from "./auth.repository";
import { AuthAccountController } from "./controllers/auth-account.controller";
import { AuthOtpController } from "./controllers/auth-otp.controller";
import { AuthPasswordController } from "./controllers/auth-password.controller";
import { AuthProfileController } from "./controllers/auth-profile.controller";
import { AuthSessionController } from "./controllers/auth-session.controller";
import { AuthAccountService } from "./services/auth-account.service";
import { AuthCleanupService } from "./services/auth-cleanup.service";
import { AuthOtpDeliveryService } from "./services/auth-otp-delivery.service";
import { AuthOtpService } from "./services/auth-otp.service";
import { AuthPasswordService } from "./services/auth-password.service";
import { AuthSessionService } from "./services/auth-session.service";
import { AuthSharedService } from "./services/auth-shared.service";
import { AuthService } from "./services/auth.service";

@Module({
    imports: [
        PrismaModule,
        SystemHealthModule,
        AuditLogModule,
        MailModule,
        StorageModule,
        NotificationModule,
        ConsentModule,
    ],

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
        AuthOtpDeliveryService,
        AuthCleanupService,
        AuthSharedService,
        AuthAccountService,
        AuthOtpService,
        AuthPasswordService,
        AuthSessionService,
    ],
    exports: [AuthService, AuthSharedService],
})
export class AuthModule {}
