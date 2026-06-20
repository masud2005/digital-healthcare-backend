import { PrismaModule } from "@global/prisma/prisma.module";
import { Module } from "@nestjs/common";
import { AdminOrderController } from "./order.controller";
import { AdminOrderRepository } from "./order.repository";
import { AdminOrderService } from "./order.service";

@Module({
    imports: [PrismaModule],
    controllers: [AdminOrderController],
    providers: [AdminOrderService, AdminOrderRepository],
})
export class AdminOrderModule {}
