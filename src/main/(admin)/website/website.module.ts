import { Module } from "@nestjs/common";
import { PrismaModule } from "@global/prisma/prisma.module";
import { StorageModule } from "@global/storage/storage.module";
import { WebsiteController } from "./website.controller";
import { WebsiteRepository } from "./website.repository";
import { WebsiteService } from "./website.service";

@Module({
    imports: [PrismaModule, StorageModule],
    controllers: [WebsiteController],
    providers: [WebsiteService, WebsiteRepository],
    exports: [WebsiteService],
})
export class WebsiteModule {}
