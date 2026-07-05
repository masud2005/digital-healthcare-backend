import { Module } from "@nestjs/common";
import { AssessmentSubmissionModule } from "./assessment-submission/assessment-submission.module";
import { CartModule } from "./cart/cart.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { MyOrderModule } from "./my-order/my-order.module";
import { PaymentModule } from "./payment/payment.module";
import { ServiceCategoryModule } from "./service/service-category.module";
import { SubscriptionModule } from "./subscription/subscription.module";
import { PaymentCardModule } from "./payment-card/payment-card.module";

@Module({
    imports: [
        ServiceCategoryModule,
        AssessmentSubmissionModule,
        CartModule,
        PaymentModule,
        DashboardModule,
        MyOrderModule,
        SubscriptionModule,
        PaymentCardModule,
    ],
})
export class PatientModule {}
