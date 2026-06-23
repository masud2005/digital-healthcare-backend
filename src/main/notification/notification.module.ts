import { PrismaModule } from "@global/prisma/prisma.module";
import { Module } from "@nestjs/common";
import { NotificationController } from "./notification.controller";
import { NotificationGateway } from "./notification.gateway";
import { NotificationRepository } from "./notification.repository";
import { NotificationService } from "./notification.service";

@Module({
    imports: [PrismaModule],
    controllers: [NotificationController],
    providers: [NotificationService, NotificationRepository, NotificationGateway],
    exports: [NotificationService],
})
export class NotificationModule {}
