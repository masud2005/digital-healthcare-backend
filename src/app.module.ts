import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller";
import { MainModule } from "./main/main.module";

@Module({
    imports: [MainModule],
    controllers: [HealthController],
})
export class AppModule {}
