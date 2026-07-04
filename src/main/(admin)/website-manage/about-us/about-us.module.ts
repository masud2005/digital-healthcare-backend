import { Module } from "@nestjs/common";
import { AboutUsController } from "./about-us.controller";
import { AboutUsService } from "./about-us.service";
import { AboutUsRepository } from "./about-us.repository";

@Module({
    controllers: [AboutUsController],
    providers: [AboutUsService, AboutUsRepository],
})
export class AboutUsModule {}
