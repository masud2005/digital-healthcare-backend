import { PrismaModule } from "@global/prisma/prisma.module";
import { StorageModule } from "@global/storage/storage.module";
import { Module } from "@nestjs/common";
import { MyOrderController } from "./my-order.controller";
import { MyOrderRepository } from "./my-order.repository";
import { MyOrderService } from "./my-order.service";

@Module({
    imports: [PrismaModule, StorageModule],
    controllers: [MyOrderController],
    providers: [MyOrderService, MyOrderRepository],
})
export class MyOrderModule {}
