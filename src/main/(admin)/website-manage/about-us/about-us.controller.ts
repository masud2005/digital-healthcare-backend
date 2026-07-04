import { Roles } from "@common/decorators";
import { JwtAuthGuard, RolesGuard } from "@common/guards";
import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AboutUsService } from "./about-us.service";
import { UpdateAboutUsDto } from "./dto/update-about-us.dto";

@ApiTags("Website Manage - About Us")
@Controller("website-manage/about-us")
export class AboutUsController {
    constructor(private readonly aboutUsService: AboutUsService) {}

    @Get()
    @ApiOperation({ summary: "Get About Us page content (Public API)" })
    get() {
        return this.aboutUsService.get();
    }

    @Patch()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIN")
    @ApiBearerAuth()
    @ApiOperation({ summary: "Update About Us page content (Admin only)" })
    update(@Body() dto: UpdateAboutUsDto) {
        return this.aboutUsService.update(dto);
    }
}
