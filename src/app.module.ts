import { GuardModule } from "@common/guards";
import { AttachmentModule } from "@global/attachment/attachment.module";
import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller";
import { MainModule } from "./main/main.module";

@Module({
    imports: [MainModule, GuardModule, AttachmentModule],
    controllers: [HealthController],
})
export class AppModule {}
