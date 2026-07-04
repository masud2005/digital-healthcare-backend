import { Module } from "@nestjs/common";
import { StorageModule } from "@global/storage/storage.module";
import { ContactPartnerSectionController } from "./contact-partner-section.controller";
import { ContactPartnerSectionService } from "./contact-partner-section.service";

@Module({
    imports: [StorageModule],
    controllers: [ContactPartnerSectionController],
    providers: [ContactPartnerSectionService],
})
export class ContactPartnerSectionModule {}
