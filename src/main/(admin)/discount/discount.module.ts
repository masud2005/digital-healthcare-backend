import { PrismaModule } from "@global/prisma/prisma.module";
import { Module } from "@nestjs/common";
import { DiscountController } from "./discount.controller";
import { DiscountRepository } from "./discount.repository";
import { DiscountService } from "./discount.service";

@Module({
    imports: [PrismaModule],
    controllers: [DiscountController],
    providers: [DiscountService, DiscountRepository],
    exports: [DiscountService],
})
export class DiscountModule {}
