import { Module } from "@nestjs/common";
import { AssessmentSubmissionModule } from "./assessment-submission/assessment-submission.module";
import { CartModule } from "./cart/cart.module";
import { ServiceCategoryModule } from "./service/service-category.module";
import { PaymentModule } from "./payment/payment.module";

@Module({
    imports: [ServiceCategoryModule, AssessmentSubmissionModule, CartModule, PaymentModule],
})
export class PatientModule {}
