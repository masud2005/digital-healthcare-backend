import { ExportModule } from "@global/export/export.module";
import { PrismaModule } from "@global/prisma/prisma.module";
import { Module } from "@nestjs/common";
import { GoogleReviewService } from "./google-review.service";
import { TestimonialController } from "./testimonial.controller";
import { TestimonialCronService } from "./testimonial-cron.service";
import { TestimonialRepository } from "./testimonial.repository";
import { TestimonialService } from "./testimonial.service";

@Module({
    imports: [PrismaModule, ExportModule],
    controllers: [TestimonialController],
    providers: [
        TestimonialService,
        TestimonialRepository,
        GoogleReviewService,
        TestimonialCronService,
    ],
    exports: [TestimonialService, GoogleReviewService],
})
export class TestimonialModule {}
