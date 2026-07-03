import { Module } from "@nestjs/common";
import { AdminServicePageController } from "./service-page.controller";
import { AdminServicePageService } from "./service-page.service";

import { StorageModule } from "@global/storage/storage.module";

@Module({
    imports: [StorageModule],
    controllers: [AdminServicePageController],
    providers: [AdminServicePageService],
})
export class AdminServicePageModule {}
