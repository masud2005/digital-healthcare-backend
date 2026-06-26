import { GuardModule } from "@common/guards";
import { AttachmentModule } from "@global/attachment/attachment.module";
import { CommunicationModule } from "@global/communication/communication.module";
import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller";
import { MainModule } from "./main/main.module";

@Module({
    imports: [MainModule, GuardModule, AttachmentModule, CommunicationModule],
    controllers: [HealthController],
})
export class AppModule {}
