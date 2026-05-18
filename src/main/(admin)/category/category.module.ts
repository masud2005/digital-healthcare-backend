import { Module } from "@nestjs/common";
import { PrismaModule } from "@global/prisma/prisma.module";
import { CategoryController } from "./category.controller";
import { CategoryRepository } from "./category.repository";
import { CategoryService } from "./category.service";

@Module({
    imports: [PrismaModule],
    controllers: [CategoryController],
    providers: [CategoryService, CategoryRepository],
})
export class CategoryModule {}
