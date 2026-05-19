import { PrismaModule } from "@global/prisma/prisma.module";
import { StorageModule } from "@global/storage/storage.module";
import { Module } from "@nestjs/common";
import { ProductController } from "./product.controller";
import { ProductRepository } from "./product.repository";
import { ProductService } from "./product.service";

@Module({
    imports: [PrismaModule, StorageModule],
    controllers: [ProductController],
    providers: [ProductService, ProductRepository],
})
export class ProductModule {}
