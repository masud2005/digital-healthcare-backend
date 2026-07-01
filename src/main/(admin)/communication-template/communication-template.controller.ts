import { AppPermission } from "@common/auth/permissions.constants";
import { RequirePermissions } from "@common/decorators";
import { Body, Controller, Get, Param, Patch, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { CommunicationChannel, CommunicationAction } from "@prisma/client";
import { CommunicationTemplateService } from "./communication-template.service";
import { UpdateTemplateDto } from "./dto/update-template.dto";
import { UpdateLayoutDto } from "./dto/update-layout.dto";
import { JwtAuthGuard, PermissionsGuard } from "@common/guards";

@ApiTags("(Admin) Communication Templates")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("admin/communication-templates")
export class CommunicationTemplateController {
    constructor(private readonly templateService: CommunicationTemplateService) {}

    // Layout
    @ApiOperation({ summary: "Get the global email layout (Header/Footer)" })
    @RequirePermissions(AppPermission.VIEW_COMMUNICATION_CENTER)
    @Get("layout")
    getGlobalLayout() {
        return this.templateService.getGlobalLayout();
    }

    @ApiOperation({ summary: "Update the global email layout" })
    @RequirePermissions(AppPermission.MANAGE_COMMUNICATION_CENTER)
    @Patch("layout")
    updateGlobalLayout(@Body() payload: UpdateLayoutDto) {
        return this.templateService.updateGlobalLayout(payload);
    }

    // Templates
    @ApiOperation({ summary: "Get available variables for all templates" })
    @ApiQuery({ name: "channel", enum: CommunicationChannel, required: false })
    @ApiQuery({ name: "action", enum: CommunicationAction, required: false })
    @RequirePermissions(AppPermission.VIEW_COMMUNICATION_CENTER)
    @Get("variables")
    getTemplateVariables(
        @Query("channel") channel?: CommunicationChannel,
        @Query("action") action?: CommunicationAction,
    ) {
        return this.templateService.getTemplateVariables(channel, action);
    }

    @ApiOperation({ summary: "Get all communication templates" })
    @ApiQuery({ name: "channel", enum: CommunicationChannel, required: false })
    @ApiQuery({ name: "action", enum: CommunicationAction, required: false })
    @RequirePermissions(AppPermission.VIEW_COMMUNICATION_CENTER)
    @Get()
    findAllTemplates(
        @Query("channel") channel?: CommunicationChannel,
        @Query("action") action?: CommunicationAction,
    ) {
        return this.templateService.findAllTemplates(channel, action);
    }

    @ApiOperation({ summary: "Get a specific communication template by ID" })
    @RequirePermissions(AppPermission.VIEW_COMMUNICATION_CENTER)
    @Get(":id")
    findTemplate(@Param("id") id: string) {
        return this.templateService.findTemplate(id);
    }

    @ApiOperation({ summary: "Update a specific communication template" })
    @RequirePermissions(AppPermission.MANAGE_COMMUNICATION_CENTER)
    @Patch(":id")
    updateTemplate(@Param("id") id: string, @Body() payload: UpdateTemplateDto) {
        return this.templateService.updateTemplate(id, payload);
    }
}
