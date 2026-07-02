import { Module } from "@nestjs/common";
import { WebsiteModule } from "../../(admin)/website/website.module";
import { PublicWebsiteController } from "./public-website.controller";

@Module({
    imports: [WebsiteModule],
    controllers: [PublicWebsiteController],
})
export class PublicWebsiteModule {}
