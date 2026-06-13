import { StorageService } from "@global/storage/storage.service";
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Patch,
    Post,
    Query,
    UploadedFile,
    UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
    ApiConsumes,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from "@nestjs/swagger";
import { ContactLeadsService } from "./contact-leads.service";
import { ContactLeadParamDto } from "./dto/contact-lead-param.dto";
import { ContactLeadQueryDto } from "./dto/contact-lead-query.dto";
import {
    ContactLeadListResponseDto,
    ContactLeadResponseDto,
} from "./dto/contact-lead-response.dto";
import { CreateContactLeadDto } from "./dto/create-contact-lead.dto";
import { UpdateContactLeadDto } from "./dto/update-contact-lead.dto";

@ApiTags("(Admin) Contact Leads")
@Controller("admin/contact-leads")
export class ContactLeadsController {
    constructor(
        private readonly contactLeadsService: ContactLeadsService,
        private readonly storageService: StorageService,
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
        if (file) {
            const uploaded = await this.storageService.uploadFile(file);
            payload.attachments = uploaded.key;
        }

        return this.contactLeadsService.create(payload);
    }

    @Get()
    @ApiOperation({ summary: "Get contact leads" })
    @ApiOkResponse({ type: ContactLeadListResponseDto })
    findAll(@Query() query: ContactLeadQueryDto) {
        return this.contactLeadsService.findAll(query);
    }

    @Get(":id")
    @ApiOperation({ summary: "Get a contact lead by id" })
    @ApiOkResponse({ type: ContactLeadResponseDto })
    findOne(@Param() params: ContactLeadParamDto) {
        return this.contactLeadsService.findOne(params.id);
    }

    @Patch(":id")
    @ApiOperation({ summary: "Update a contact lead" })
    @ApiConsumes("multipart/form-data")
    @UseInterceptors(FileInterceptor("attachments"))
    @ApiOkResponse({ type: ContactLeadResponseDto })
    async update(
        @Param() params: ContactLeadParamDto,
        @Body() payload: UpdateContactLeadDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        if (file) {
            const uploaded = await this.storageService.uploadFile(file);
            payload.attachments = uploaded.key;
        }

        return this.contactLeadsService.update(params.id, payload);
    }

    @Delete(":id")
    @HttpCode(204)
    @ApiOperation({ summary: "Delete a contact lead" })
    @ApiNoContentResponse({ description: "Contact lead deleted successfully" })
    async remove(@Param() params: ContactLeadParamDto) {
        await this.contactLeadsService.remove(params.id);
    }
}
