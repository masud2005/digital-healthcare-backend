import { Module } from "@nestjs/common";
import { PublicDoctorModule } from "./public-doctor/public-doctor.module";
import { PublicBlogModule } from "./public-blog/public-blog.module";

@Module({
    imports: [PublicDoctorModule, PublicBlogModule],
})
export class PublicModule {}
