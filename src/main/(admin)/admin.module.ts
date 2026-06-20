import { Module } from "@nestjs/common";
import { AssessmentModule } from "./assessment/assessment.module";
import { CategoryModule } from "./category/category.module";
import { ContactLeadsModule } from "./contact-leads/contact-leads.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { DiscountModule } from "./discount/discount.module";
import { HomePageModule } from "./homepage/homepage.module";
import { ManageDoctorModule } from "./manage-doctor/manage-doctor.module";
import { AdminOrderModule } from "./order/order.module";
import { PatientManageModule } from "./patient-manage/patient-manage.module";
import { AdminPaymentModule } from "./payment/payment.module";
import { ProductModule } from "./product/product.module";
import { QuestionModule } from "./question/question.module";
import { TestimonialModule } from "./testimonial/testimonial.module";
import { WebsiteModule } from "./website/website.module";

@Module({
    imports: [
        CategoryModule,
        ProductModule,
        AssessmentModule,
        QuestionModule,
        WebsiteModule,
        DashboardModule,
        ManageDoctorModule,
        PatientManageModule,
        AdminPaymentModule,
        AdminOrderModule,
        ContactLeadsModule,
        TestimonialModule,
        DiscountModule,
        HomePageModule,
    ],
})
export class AdminModule {}
