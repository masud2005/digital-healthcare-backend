import { Module } from "@nestjs/common";
import { PublicServicePageController } from "./public-service-page.controller";
import { PublicServicePageService } from "./public-service-page.service";

import { StorageModule } from "@global/storage/storage.module";

@Module({
    imports: [StorageModule],
    controllers: [PublicServicePageController],
    providers: [PublicServicePageService],
})
export class PublicServicePageModule {}
