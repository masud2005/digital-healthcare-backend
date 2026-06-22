import { Module } from "@nestjs/common";
import { AssessmentSubmissionModule } from "./assessment-submission/assessment-submission.module";
import { CartModule } from "./cart/cart.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { MyOrderModule } from "./my-order/my-order.module";
import { PaymentModule } from "./payment/payment.module";
import { ServiceCategoryModule } from "./service/service-category.module";
import { PublicDoctorModule } from "./public-doctor/public-doctor.module";

@Module({
    imports: [
        ServiceCategoryModule,
        AssessmentSubmissionModule,
        CartModule,
        PaymentModule,
        DashboardModule,
        MyOrderModule,
        PublicDoctorModule,
    ],
})
export class PatientModule {}
