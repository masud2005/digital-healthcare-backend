import { PrismaModule } from "@global/prisma/prisma.module";
import { StorageModule } from "@global/storage/storage.module";
import { Module } from "@nestjs/common";
import { ServiceCategoryController } from "./service-category.controller";
import { ServiceCategoryRepository } from "./service-category.repository";
import { ServiceCategoryService } from "./service-category.service";

@Module({
    imports: [PrismaModule, StorageModule],
    controllers: [ServiceCategoryController],
    providers: [ServiceCategoryService, ServiceCategoryRepository],
})
export class ServiceCategoryModule {}
