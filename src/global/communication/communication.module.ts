import { Global, Module } from "@nestjs/common";
import { PrismaModule } from "@global/prisma/prisma.module";
import { MailModule } from "@global/mail/mail.module";
import { SystemHealthModule } from "@main/(compliance)/system-healthar/system-health.module";
import { StorageModule } from "@global/storage/storage.module";
import { CommunicationService } from "./communication.service";

@Global()
@Module({
    imports: [PrismaModule, MailModule, SystemHealthModule, StorageModule],
    providers: [CommunicationService],
    exports: [CommunicationService],
})
export class CommunicationModule {}
