import { AppPermission } from "@common/auth/permissions.constants";
import { RequirePermissions } from "@common/decorators";
import { JwtAuthGuard, PermissionsGuard } from "@common/guards";
import { Body, Controller, Get, Param, Patch, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UpdateServicePageDto } from "./dto/update-service-page.dto";
import { AdminServicePageService } from "./service-page.service";

@ApiTags("(Admin) Service Page")
@Controller("admin/service-page")
export class AdminServicePageController {
    constructor(private readonly servicePageService: AdminServicePageService) {}

    @Get(":categoryId")
    @ApiOperation({ summary: "Get all sections for a service page" })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions(AppPermission.MANAGE_WEBSITE_MANAGEMENT)
    getServicePage(@Param("categoryId") categoryId: string) {
        return this.servicePageService.getServicePage(categoryId);
    }

    @Patch(":categoryId")
    @ApiOperation({ summary: "Update all sections for a service page" })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions(AppPermission.MANAGE_WEBSITE_MANAGEMENT)
    updateServicePage(@Param("categoryId") categoryId: string, @Body() dto: UpdateServicePageDto) {
        return this.servicePageService.updateServicePage(categoryId, dto);
    }
}
