import { AttachmentService } from "@global/attachment/attachment.service";
import {
    Body,
    Controller,
    Delete,
    HttpCode,
    Param,
    Patch,
    Post,
    Get,
    Query,
    Res,
    UploadedFile,
    UseInterceptors,
    UseGuards,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
    ApiBearerAuth,
    ApiConsumes,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiOperation,
    ApiProduces,
    ApiQuery,
    ApiTags,
} from "@nestjs/swagger";
import type { Response } from "express";
import { ContactLeadsService } from "./contact-leads.service";
import { ContactLeadParamDto } from "./dto/contact-lead-param.dto";
import { ContactLeadQueryDto } from "./dto/contact-lead-query.dto";
import {
    ContactLeadListResponseDto,
    ContactLeadResponseDto,
} from "./dto/contact-lead-response.dto";
import { CreateContactLeadDto } from "./dto/create-contact-lead.dto";
import { UpdateContactLeadDto } from "./dto/update-contact-lead.dto";
import { RespondContactLeadDto } from "./dto/respond-contact-lead.dto";
import { OptionalJwtAuthGuard } from "@common/guards/optional-jwt-auth.guard";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "@main/auth/auth.types";

@ApiTags("(Admin) Contact Leads")
@Controller("admin/contact-leads")
export class ContactLeadsController {
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

    @Get()
    @ApiOperation({ summary: "Get contact leads" })
    @ApiOkResponse({ type: ContactLeadListResponseDto })
    findAll(@Query() query: ContactLeadQueryDto) {
        return this.contactLeadsService.findAll(query);
    }

    @Get("export")
    @UseGuards(OptionalJwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Export contact leads as CSV" })
    @ApiProduces("text/csv")
    @ApiQuery({ name: "search", required: false })
    @ApiQuery({ name: "service", required: false })
    @ApiQuery({ name: "read", required: false, type: Boolean })
    @ApiQuery({ name: "responded", required: false, type: Boolean })
    async export(
        @Query("search") search?: string,
        @Query("service") service?: string,
        @Query("read") read?: string,
        @Query("responded") responded?: string,
        @Res({ passthrough: false }) res?: Response,
        @CurrentUser() user?: AuthenticatedUser,
    ) {
        const parseBool = (val?: string): boolean | undefined => {
            if (val === "true") return true;
            if (val === "false") return false;
            return undefined;
        };

        const csvContent = await this.contactLeadsService.exportCsv(
            {
                search,
                service,
                read: parseBool(read),
                responded: parseBool(responded),
            },
            user,
        );

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
        const filename = `contact-leads-${timestamp}.csv`;

        res!.setHeader("Content-Type", "text/csv; charset=utf-8");
        res!.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res!.setHeader("Cache-Control", "no-cache");
        res!.send(csvContent);
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
        let attachmentId: string | undefined = undefined;
        if (file) {
            const res = await this.attachmentService.upload([file], {
                context: "CONTACT_LEAD_ATTACHMENT",
            });
            attachmentId = Array.isArray(res.data) ? res.data[0].id : (res.data as any).id;
        }

        return this.contactLeadsService.update(params.id, {
            ...payload,
            attachments: attachmentId || undefined,
        });
    }

    @Delete(":id")
    @HttpCode(204)
    @ApiOperation({ summary: "Delete a contact lead" })
    @ApiNoContentResponse({ description: "Contact lead deleted successfully" })
    async remove(@Param() params: ContactLeadParamDto) {
        await this.contactLeadsService.remove(params.id);
    }

    @Post(":id/respond")
    @ApiOperation({ summary: "Send a response back to a contact lead" })
    @ApiConsumes("multipart/form-data")
    @UseInterceptors(FileInterceptor("attachments"))
    @ApiOkResponse({ type: ContactLeadResponseDto })
    async respond(
        @Param() params: ContactLeadParamDto,
        @Body() payload: RespondContactLeadDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        return this.contactLeadsService.respond(params.id, payload, file);
    }
}
