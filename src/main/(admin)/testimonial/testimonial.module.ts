import { PrismaModule } from "@global/prisma/prisma.module";
import { Module } from "@nestjs/common";
import { TestimonialController } from "./testimonial.controller";
import { TestimonialRepository } from "./testimonial.repository";
import { TestimonialService } from "./testimonial.service";

@Module({
    imports: [PrismaModule],
    controllers: [TestimonialController],
    providers: [TestimonialService, TestimonialRepository],
    exports: [TestimonialService],
})
export class TestimonialModule {}
