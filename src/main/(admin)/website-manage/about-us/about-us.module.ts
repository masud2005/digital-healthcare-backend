import { Module } from "@nestjs/common";
import { StorageModule } from "@global/storage/storage.module";
import { AboutUsController } from "./about-us.controller";
import { AboutUsService } from "./about-us.service";
import { AboutUsRepository } from "./about-us.repository";

@Module({
    imports: [StorageModule],
    controllers: [AboutUsController],
    providers: [AboutUsService, AboutUsRepository],
})
export class AboutUsModule {}
