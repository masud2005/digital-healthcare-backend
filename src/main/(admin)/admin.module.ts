import { Module } from "@nestjs/common";
import { AssessmentModule } from "./assessment/assessment.module";
import { CategoryModule } from "./category/category.module";
import { ContactLeadsModule } from "./contact-leads/contact-leads.module";
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
        ContactLeadsModule,
        TestimonialModule,
    ],
})
export class AdminModule {}
