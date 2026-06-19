import { Module } from "@nestjs/common";
import { PrismaModule } from "@global/prisma/prisma.module";
import { CartModule } from "../cart/cart.module";
import { PaymentController } from "./payment.controller";
import { PaymentRepository } from "./payment.repository";
import { PaymentService } from "./payment.service";

@Module({
    imports: [CartModule, PrismaModule],
    controllers: [PaymentController],
    providers: [PaymentService, PaymentRepository],
    exports: [PaymentService],
})
export class PaymentModule {}
