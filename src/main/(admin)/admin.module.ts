import { Module } from "@nestjs/common";
import { AssessmentModule } from "./assessment/assessment.module";
import { CategoryModule } from "./category/category.module";
import { ProductModule } from "./product/product.module";
import { QuestionModule } from "./question/question.module";
import { WebsiteModule } from "./website/website.module";
import { ManageDoctorModule } from "./manage-module/manage-doctor.module";

@Module({
    imports: [
        CategoryModule,
        ProductModule,
        AssessmentModule,
        QuestionModule,
        WebsiteModule,
        ManageDoctorModule,
    ],
})
export class AdminModule { }
