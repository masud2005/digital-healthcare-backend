import { Roles } from "@common/decorators";
import { JwtAuthGuard, RolesGuard } from "@common/guards";
import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { HowItWorksService } from "./how-it-works.service";
import { UpdateHowItWorksDto } from "./dto/update-how-it-works.dto";

@ApiTags("Website Manage - How It Works")
@Controller("website-manage/how-it-works")
export class HowItWorksController {
    constructor(private readonly howItWorksService: HowItWorksService) {}

    @Get()
    @ApiOperation({ summary: "Get How It Works page content (Public API)" })
    get() {
        return this.howItWorksService.get();
    }

    @Patch()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIN")
    @ApiBearerAuth()
    @ApiOperation({ summary: "Update How It Works page content (Admin only)" })
    update(@Body() dto: UpdateHowItWorksDto) {
        return this.howItWorksService.update(dto);
    }
}
