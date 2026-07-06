import { Module } from "@nestjs/common";
import { PaymentCardController } from "./payment-card.controller";
import { PaymentCardService } from "./payment-card.service";

import { CloverModule } from "@global/clover/clover.module";

@Module({
    imports: [CloverModule],
    controllers: [PaymentCardController],
    providers: [PaymentCardService],
    exports: [PaymentCardService],
})
export class PaymentCardModule {}
