import { Module } from "@nestjs/common";
import { StorageModule } from "@global/storage/storage.module";
import { ShippingInfoController } from "./shipping-info.controller";
import { ShippingInfoService } from "./shipping-info.service";

@Module({
    imports: [StorageModule],
    controllers: [ShippingInfoController],
    providers: [ShippingInfoService],
})
export class ShippingInfoModule {}
