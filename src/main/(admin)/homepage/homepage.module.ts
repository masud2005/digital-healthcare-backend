import { Module } from "@nestjs/common";
import { PrismaModule } from "@global/prisma/prisma.module";
import { StorageModule } from "@global/storage/storage.module";
import { HomePageController } from "./homepage.controller";
import { HomePageRepository } from "./homepage.repository";
import { HomePageService } from "./homepage.service";

@Module({
    imports: [PrismaModule, StorageModule],
    controllers: [HomePageController],
    providers: [HomePageService, HomePageRepository],
    exports: [HomePageService],
})
export class HomePageModule {}
