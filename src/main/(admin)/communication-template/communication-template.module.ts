import { Module } from "@nestjs/common";
import { CommunicationTemplateController } from "./communication-template.controller";
import { CommunicationTemplateService } from "./communication-template.service";
import { CommunicationTemplateRepository } from "./communication-template.repository";
import { StorageModule } from "@global/storage/storage.module";

@Module({
    imports: [StorageModule],
    controllers: [CommunicationTemplateController],
    providers: [CommunicationTemplateService, CommunicationTemplateRepository],
})
export class CommunicationTemplateModule {}
