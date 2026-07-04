import { StorageModule } from "@global/storage/storage.module";
import { Module } from "@nestjs/common";
import { SideWidgetController } from "./side-widget.controller";
import { SideWidgetService } from "./side-widget.service";

@Module({
    imports: [StorageModule],
    controllers: [SideWidgetController],
    providers: [SideWidgetService],
})
export class SideWidgetModule {}
