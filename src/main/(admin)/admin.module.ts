import { Module } from "@nestjs/common";
import { CategoryModule } from "./category/category.module";
import { ProductModule } from "./product/product.module";
import { WebsiteModule } from "./website/website.module";

@Module({
    imports: [CategoryModule, ProductModule, WebsiteModule],
})
export class AdminModule {}
