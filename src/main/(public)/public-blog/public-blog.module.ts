import { Module } from "@nestjs/common";
import { BlogsModule } from "../../(admin)/blogs/blogs.module";
import { PublicBlogController } from "./public-blog.controller";

@Module({
    imports: [BlogsModule],
    controllers: [PublicBlogController],
})
export class PublicBlogModule {}
