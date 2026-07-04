import { Module } from "@nestjs/common";
import { PublicNewsletterController } from "./public-newsletter.controller";
import { PublicNewsletterService } from "./public-newsletter.service";

@Module({
    controllers: [PublicNewsletterController],
    providers: [PublicNewsletterService],
})
export class PublicNewsletterModule {}
