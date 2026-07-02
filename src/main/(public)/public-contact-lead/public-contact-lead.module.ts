import { Module } from "@nestjs/common";
import { AttachmentModule } from "@global/attachment/attachment.module";
import { ContactLeadsModule } from "../../(admin)/contact-leads/contact-leads.module";
import { PublicContactLeadController } from "./public-contact-lead.controller";

@Module({
    imports: [ContactLeadsModule, AttachmentModule],
    controllers: [PublicContactLeadController],
})
export class PublicContactLeadModule {}
