import { PrismaModule } from "@global/prisma/prisma.module";
import { StorageModule } from "@global/storage/storage.module";
import { Module } from "@nestjs/common";
import { CartController } from "./cart.controller";
import { CartRepository } from "./cart.repository";
import { CartService } from "./cart.service";

@Module({
    imports: [PrismaModule, StorageModule],
    controllers: [CartController],
    providers: [CartService, CartRepository],
    exports: [CartService, CartRepository],
})
export class CartModule {}
