import { Module } from "@nestjs/common";
import { HomePageModule } from "../../(admin)/homepage/homepage.module";
import { PublicHomePageController } from "./public-homepage.controller";

@Module({
    imports: [HomePageModule],
    controllers: [PublicHomePageController],
})
export class PublicHomePageModule {}
