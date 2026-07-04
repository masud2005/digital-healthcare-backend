import { Module, Global } from "@nestjs/common";
import { MailModule } from "@global/mail/mail.module";
import { MailQueueService } from "./mail-queue.service";

@Global()
@Module({
    imports: [MailModule],
    providers: [MailQueueService],
    exports: [MailQueueService],
})
export class MailQueueModule {}
