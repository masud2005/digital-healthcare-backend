import { Module } from "@nestjs/common";
import { PublicDoctorModule } from "./public-doctor/public-doctor.module";
import { PublicBlogModule } from "./public-blog/public-blog.module";
import { PublicContactLeadModule } from "./public-contact-lead/public-contact-lead.module";
import { PublicHomePageModule } from "./public-homepage/public-homepage.module";
import { PublicWebsiteModule } from "./public-website/public-website.module";
import { PublicSideEffectReportModule } from "./public-side-effect-report/public-side-effect-report.module";

@Module({
    imports: [
        PublicDoctorModule,
        PublicBlogModule,
        PublicContactLeadModule,
        PublicHomePageModule,
        PublicWebsiteModule,
        PublicSideEffectReportModule,
    ],
})
export class PublicModule {}

