import { Roles } from "@common/decorators";
import { JwtAuthGuard, RolesGuard } from "@common/guards";
import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UpdateLabTestingHeroDto } from "./dto/update-lab-testing-hero.dto";
import { UpdateLabTestingSectionDto } from "./dto/update-lab-testing-section.dto";
import { LabTestingService } from "./lab-testing.service";

@ApiTags("Website Manage - Lab Testing")
@Controller("website-manage/lab-testing")
export class LabTestingController {
    constructor(private readonly service: LabTestingService) {}

    @Get("hero")
    @ApiOperation({ summary: "Get Lab Testing Hero (Public API)" })
    getHero() {
        return this.service.getHero();
    }

    @Patch("hero")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIN")
    @ApiBearerAuth()
    @ApiOperation({ summary: "Update Lab Testing Hero (Admin only)" })
    updateHero(@Body() dto: UpdateLabTestingHeroDto) {
        return this.service.updateHero(dto);
    }

    @Get("section")
    @ApiOperation({ summary: "Get Lab Testing Section (Public API)" })
    getSection() {
        return this.service.getSection();
    }

    @Patch("section")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIN")
    @ApiBearerAuth()
    @ApiOperation({ summary: "Update Lab Testing Section (Admin only)" })
    updateSection(@Body() dto: UpdateLabTestingSectionDto) {
        return this.service.updateSection(dto);
    }
}
