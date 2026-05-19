import { Module } from "@nestjs/common";
import { AssessmentModule } from "./assessment/assessment.module";
import { CategoryModule } from "./category/category.module";
import { ProductModule } from "./product/product.module";

@Module({
    imports: [CategoryModule, ProductModule, AssessmentModule],
})
export class AdminModule {}
