import { PrismaModule } from "@global/prisma/prisma.module";
import { StorageModule } from "@global/storage/storage.module";
import { Module } from "@nestjs/common";
import { NotificationModule } from "../../notification/notification.module";
import { AdminOrderController } from "./order.controller";
import { AdminOrderRepository } from "./order.repository";
import { AdminOrderService } from "./order.service";

@Module({
    imports: [PrismaModule, NotificationModule, StorageModule],
    controllers: [AdminOrderController],
    providers: [AdminOrderService, AdminOrderRepository],
})
export class AdminOrderModule {}
