import { Roles } from "@common/decorators";
import { JwtAuthGuard, RolesGuard } from "@common/guards";
import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UpdateMedicalTeamSectionDto } from "./dto/update-medical-team-section.dto";
import { MedicalTeamSectionService } from "./medical-team-section.service";

@ApiTags("Website Manage - Medical Team Section")
@Controller("website-manage/medical-team-section")
export class MedicalTeamSectionController {
    constructor(private readonly medicalTeamSectionService: MedicalTeamSectionService) {}

    @Get()
    @ApiOperation({ summary: "Get Medical Team Section (Public API)" })
    get() {
        return this.medicalTeamSectionService.get();
    }

    @Patch()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIN")
    @ApiBearerAuth()
    @ApiOperation({ summary: "Update Medical Team Section (Admin only)" })
    update(@Body() dto: UpdateMedicalTeamSectionDto) {
        return this.medicalTeamSectionService.update(dto);
    }
}
