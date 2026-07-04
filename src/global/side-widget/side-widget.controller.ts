import { Roles } from "@common/decorators";
import { JwtAuthGuard, RolesGuard } from "@common/guards";
import { Body, Controller, Get, Param, Patch, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { GetSideWidgetQueryDto } from "./dto/get-side-widget.dto";
import { UpdateSideWidgetDto } from "./dto/update-side-widget.dto";
import { SideWidgetService } from "./side-widget.service";

@ApiTags("Side Widgets")
@Controller("side-widget")
export class SideWidgetController {
    constructor(private readonly sideWidgetService: SideWidgetService) {}

    @Patch(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIN")
    @ApiBearerAuth()
    @ApiOperation({ summary: "Update a Side Widget (Admin only)" })
    update(@Param("id") id: string, @Body() dto: UpdateSideWidgetDto) {
        return this.sideWidgetService.update(id, dto);
    }

    @Get()
    @ApiOperation({ summary: "Get Side Widgets filtered by pageType (Public API)" })
    findAll(@Query() query: GetSideWidgetQueryDto) {
        return this.sideWidgetService.findAll(query.pageType);
    }
}
