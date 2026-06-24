import { PrismaModule } from "@global/prisma/prisma.module";
import { Module } from "@nestjs/common";
import { NotificationModule } from "../../notification/notification.module";
import { AdminOrderController } from "./order.controller";
import { AdminOrderRepository } from "./order.repository";
import { AdminOrderService } from "./order.service";

@Module({
    imports: [PrismaModule, NotificationModule],
    controllers: [AdminOrderController],
    providers: [AdminOrderService, AdminOrderRepository],
})
export class AdminOrderModule {}
