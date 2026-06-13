import { Module } from "@nestjs/common";
import { SystemHealthModule } from "@main/(compliance)/system-health/system-health.module";
import { MailService } from "./mail.service";

@Module({
    imports: [SystemHealthModule],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule {}
