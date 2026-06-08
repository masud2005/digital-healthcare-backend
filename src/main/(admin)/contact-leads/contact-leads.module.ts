import { PrismaModule } from "@global/prisma/prisma.module";
import { StorageModule } from "@global/storage/storage.module";
import { Module } from "@nestjs/common";
import { ContactLeadsController } from "./contact-leads.controller";
import { ContactLeadsRepository } from "./contact-leads.repository";
import { ContactLeadsService } from "./contact-leads.service";

@Module({
    imports: [PrismaModule, StorageModule],
    controllers: [ContactLeadsController],
    providers: [ContactLeadsService, ContactLeadsRepository],
    exports: [ContactLeadsService],
})
export class ContactLeadsModule {}
