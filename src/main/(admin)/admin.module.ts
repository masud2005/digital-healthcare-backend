import { Module } from "@nestjs/common";
import { CommunicationTemplateModule } from "./communication-template/communication-template.module";
import { AssessmentModule } from "./assessment/assessment.module";
import { DocumentCenterModule } from "./document-center/document-center.module";
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
import { AdminServicePageModule } from "./service-page/service-page.module";
import { EmployeePermissionModule } from "./employee-permission/employee-permission.module";
import { BlogsModule } from "./blogs/blogs.module";

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
        DocumentCenterModule,
        CommunicationTemplateModule,
        EmployeePermissionModule,
        BlogsModule,
        AdminServicePageModule,
    ],
})
export class AdminModule {}
