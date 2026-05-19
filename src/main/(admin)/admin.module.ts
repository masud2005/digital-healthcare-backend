import { Module } from "@nestjs/common";
import { AssessmentModule } from "./assessment/assessment.module";
import { CategoryModule } from "./category/category.module";
import { ProductModule } from "./product/product.module";
import { QuestionModule } from "./question/question.module";

@Module({
    imports: [CategoryModule, ProductModule, AssessmentModule, QuestionModule],
})
export class AdminModule {}
