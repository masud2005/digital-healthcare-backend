import { PrismaModule } from "@global/prisma/prisma.module";
import { Module } from "@nestjs/common";
import { AdminPaymentController } from "./payment.controller";
import { AdminPaymentRepository } from "./payment.repository";
import { AdminPaymentService } from "./payment.service";

@Module({
    imports: [PrismaModule],
    controllers: [AdminPaymentController],
    providers: [AdminPaymentService, AdminPaymentRepository],
})
export class AdminPaymentModule {}
