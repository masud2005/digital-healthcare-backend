import { PrismaModule } from "@global/prisma/prisma.module";
import { StorageModule } from "@global/storage/storage.module";
import { Module } from "@nestjs/common";
import { PublicProductController } from "./public-product.controller";
import { PublicProductRepository } from "./public-product.repository";
import { PublicProductService } from "./public-product.service";
import { ServiceCategoryController } from "./service-category.controller";
import { ServiceCategoryRepository } from "./service-category.repository";
import { ServiceCategoryService } from "./service-category.service";

@Module({
    imports: [PrismaModule, StorageModule],
    controllers: [ServiceCategoryController, PublicProductController],
    providers: [
        ServiceCategoryService,
        ServiceCategoryRepository,
        PublicProductService,
        PublicProductRepository,
    ],
})
export class ServiceCategoryModule {}
