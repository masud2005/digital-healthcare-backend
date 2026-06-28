import { Module } from "@nestjs/common";
import { PrismaModule } from "@global/prisma/prisma.module";
import { StorageModule } from "@global/storage/storage.module";
import { BlogsController } from "./blogs.controller";
import { BlogsService } from "./blogs.service";
import { BlogsRepository } from "./blogs.repository";

@Module({
    imports: [PrismaModule, StorageModule],
    controllers: [BlogsController],
    providers: [BlogsService, BlogsRepository],
    exports: [BlogsService],
})
export class BlogsModule {}
