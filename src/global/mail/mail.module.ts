import { SystemHealthModule } from "@main/(compliance)/system-healthar/system-health.module";
import { Module } from "@nestjs/common";
import { MailService } from "./mail.service";

@Module({
    imports: [SystemHealthModule],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule {}
