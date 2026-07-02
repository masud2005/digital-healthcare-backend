import { AppPermission } from "@common/auth/permissions.constants";
import { RequirePermissions } from "@common/decorators";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { JwtAuthGuard, PermissionsGuard } from "@common/guards";
import type { AuthenticatedUser } from "@main/auth/auth.types";
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
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
    ApiBearerAuth,
    ApiConsumes,
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
import { RespondContactLeadDto } from "./dto/respond-contact-lead.dto";
import { UpdateContactLeadDto } from "./dto/update-contact-lead.dto";

@ApiTags("(Admin) Contact Leads")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("admin/contact-leads")
export class ContactLeadsController {
    constructor(private readonly contactLeadsService: ContactLeadsService) {}

    @Get()
    @RequirePermissions(AppPermission.VIEW_CONTACT_LEADS)
    @ApiOperation({ summary: "Get contact leads" })
    @ApiOkResponse({ type: ContactLeadListResponseDto })
    findAll(@Query() query: ContactLeadQueryDto) {
        return this.contactLeadsService.findAll(query);
    }

    @Get("export")
    @RequirePermissions(AppPermission.VIEW_CONTACT_LEADS)
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
    @RequirePermissions(AppPermission.VIEW_CONTACT_LEADS)
    @ApiOperation({ summary: "Get a contact lead by id" })
    @ApiOkResponse({ type: ContactLeadResponseDto })
    findOne(@Param() params: ContactLeadParamDto) {
        return this.contactLeadsService.findOne(params.id);
    }

    @Patch(":id")
    @RequirePermissions(AppPermission.MANAGE_CONTACT_LEADS)
    @ApiOperation({ summary: "Update a contact lead" })
    @ApiConsumes("multipart/form-data")
    @UseInterceptors(FileInterceptor("attachments"))
    @ApiOkResponse({ type: ContactLeadResponseDto })
    async update(
        @Param() params: ContactLeadParamDto,
        @Body() payload: UpdateContactLeadDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        return this.contactLeadsService.update(params.id, payload);
    }

    @Delete(":id")
    @RequirePermissions(AppPermission.MANAGE_CONTACT_LEADS)
    @HttpCode(204)
    @ApiOperation({ summary: "Delete a contact lead" })
    @ApiNoContentResponse({ description: "Contact lead deleted successfully" })
    async remove(@Param() params: ContactLeadParamDto) {
        await this.contactLeadsService.remove(params.id);
    }

    @Post(":id/respond")
    @RequirePermissions(AppPermission.MANAGE_CONTACT_LEADS)
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
