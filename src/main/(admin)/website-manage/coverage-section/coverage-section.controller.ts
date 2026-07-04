import { Roles } from "@common/decorators";
import { JwtAuthGuard, RolesGuard } from "@common/guards";
import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UpdateCoverageSectionDto } from "./dto/update-coverage-section.dto";
import { CoverageSectionService } from "./coverage-section.service";

@ApiTags("Website Manage - Coverage Section")
@Controller("website-manage/coverage-section")
export class CoverageSectionController {
    constructor(private readonly coverageSectionService: CoverageSectionService) {}

    @Get()
    @ApiOperation({ summary: "Get Coverage Section (Public API)" })
    get() {
        return this.coverageSectionService.get();
    }

    @Patch()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIN")
    @ApiBearerAuth()
    @ApiOperation({ summary: "Update Coverage Section (Admin only)" })
    update(@Body() dto: UpdateCoverageSectionDto) {
        return this.coverageSectionService.update(dto);
    }
}
