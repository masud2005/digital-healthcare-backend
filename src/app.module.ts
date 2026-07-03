import { GuardModule } from "@common/guards";
import { AttachmentModule } from "@global/attachment/attachment.module";
import { CloverModule } from "@global/clover/clover.module";
import { CommunicationModule } from "@global/communication/communication.module";
import { CtaSectionModule } from "@global/cta-section/cta-section.module";
import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { HealthController } from "./health.controller";
import { MainModule } from "./main/main.module";

@Module({
    imports: [
        MainModule,
        GuardModule,
        AttachmentModule,
        CommunicationModule,
        CloverModule,
        CtaSectionModule,
        ScheduleModule.forRoot(),
    ],
    controllers: [HealthController],
})
export class AppModule {}
