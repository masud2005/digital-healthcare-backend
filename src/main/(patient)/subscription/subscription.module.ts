import { PrismaModule } from "@global/prisma/prisma.module";
import { CloverModule } from "@global/clover/clover.module";
import { Module } from "@nestjs/common";
import { NotificationModule } from "../../notification/notification.module";
import { SubscriptionController } from "./subscription.controller";
import { SubscriptionRepository } from "./subscription.repository";
import { SubscriptionService } from "./subscription.service";
import { SubscriptionCronService } from "./subscription-cron.service";

@Module({
    imports: [PrismaModule, CloverModule, NotificationModule],
    controllers: [SubscriptionController],
    providers: [SubscriptionService, SubscriptionRepository, SubscriptionCronService],
    exports: [SubscriptionService],
})
export class SubscriptionModule {}
