import { Body, Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes, ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AttachmentService } from "@global/attachment/attachment.service";
import { ContactLeadsService } from "../../(admin)/contact-leads/contact-leads.service";
import { CreateContactLeadDto } from "../../(admin)/contact-leads/dto/create-contact-lead.dto";
import { ContactLeadResponseDto } from "../../(admin)/contact-leads/dto/contact-lead-response.dto";

@ApiTags("(Public) Contact Leads")
@Controller("public/contact-leads")
export class PublicContactLeadController {
    constructor(
        private readonly contactLeadsService: ContactLeadsService,
        private readonly attachmentService: AttachmentService,
    ) {}

    @Post()
    @ApiOperation({ summary: "Create a contact lead" })
    @ApiConsumes("multipart/form-data")
    @UseInterceptors(FileInterceptor("attachments"))
    @ApiCreatedResponse({ type: ContactLeadResponseDto })
    async create(
        @Body() payload: CreateContactLeadDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        let attachmentId: string | undefined = undefined;
        if (file) {
            const res = await this.attachmentService.upload([file], {
                context: "CONTACT_LEAD_ATTACHMENT",
            });
            attachmentId = Array.isArray(res.data) ? res.data[0].id : (res.data as any).id;
        }

        return this.contactLeadsService.create({
            ...payload,
            attachments: attachmentId || undefined,
        });
    }
}
