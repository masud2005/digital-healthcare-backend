import { Module } from "@nestjs/common";
import { StorageModule } from "@global/storage/storage.module";
import { ContactSideWidgetController } from "./contact-side-widget.controller";
import { ContactSideWidgetService } from "./contact-side-widget.service";

@Module({
    imports: [StorageModule],
    controllers: [ContactSideWidgetController],
    providers: [ContactSideWidgetService],
})
export class ContactSideWidgetModule {}
