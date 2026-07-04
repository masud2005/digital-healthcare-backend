import { Roles } from "@common/decorators";
import { JwtAuthGuard, RolesGuard } from "@common/guards";
import { Body, Controller, Get, Patch, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { GetFaqQueryDto } from "./dto/get-faq.dto";
import { UpdateFaqDto } from "./dto/update-faq.dto";
import { FaqService } from "./faq.service";

@ApiTags("FAQ sections")
@Controller("faq")
export class FaqController {
    constructor(private readonly faqService: FaqService) {}

    @Get()
    @ApiOperation({ summary: "Get FAQ filtered by pageType (Public API)" })
    get(@Query() query: GetFaqQueryDto) {
        return this.faqService.get(query);
    }

    @Patch()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIN")
    @ApiBearerAuth()
    @ApiOperation({ summary: "Update FAQ for a specific pageType (Admin only)" })
    update(@Body() dto: UpdateFaqDto) {
        return this.faqService.update(dto);
    }
}
