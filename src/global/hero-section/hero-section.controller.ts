import { Roles } from "@common/decorators";
import { JwtAuthGuard, RolesGuard } from "@common/guards";
import { Body, Controller, Get, Param, Patch, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { GetHeroSectionQueryDto } from "./dto/get-hero-section.dto";
import { UpdateHeroSectionDto } from "./dto/update-hero-section.dto";
import { HeroSectionService } from "./hero-section.service";

@ApiTags("Hero Sections")
@Controller("hero-section")
export class HeroSectionController {
    constructor(private readonly heroSectionService: HeroSectionService) {}

    @Patch(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIN")
    @ApiBearerAuth()
    @ApiOperation({ summary: "Update a Hero section (Admin only)" })
    update(@Param("id") id: string, @Body() dto: UpdateHeroSectionDto) {
        return this.heroSectionService.update(id, dto);
    }

    @Get()
    @ApiOperation({ summary: "Get Hero sections filtered by pageType (Public API)" })
    findAll(@Query() query: GetHeroSectionQueryDto) {
        return this.heroSectionService.findAll(query.pageType);
    }
}
