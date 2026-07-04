import { Module } from "@nestjs/common";
import { BillingCancellationController } from "./billing-cancellation.controller";
import { BillingCancellationService } from "./billing-cancellation.service";
import { BillingCancellationRepository } from "./billing-cancellation.repository";

@Module({
    controllers: [BillingCancellationController],
    providers: [BillingCancellationService, BillingCancellationRepository],
})
export class BillingCancellationModule {}
