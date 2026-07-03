import { Roles } from "@common/decorators";
import { JwtAuthGuard, RolesGuard } from "@common/guards";
import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiOperation,
    ApiTags,
    ApiOkResponse,
    ApiCreatedResponse,
} from "@nestjs/swagger";
import { CreateCtaSectionDto } from "./dto/create-cta-section.dto";
import { GetCtaSectionQueryDto } from "./dto/get-cta-section.dto";
import { UpdateCtaSectionDto } from "./dto/update-cta-section.dto";
import { CtaSectionService } from "./cta-section.service";

@ApiTags("CTA Sections")
@Controller("cta-section")
export class CtaSectionController {
    constructor(private readonly ctaSectionService: CtaSectionService) {}

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIN")
    @ApiBearerAuth()
    @ApiOperation({ summary: "Create a new CTA section (Admin only)" })
    create(@Body() dto: CreateCtaSectionDto) {
        return this.ctaSectionService.create(dto);
    }

    @Patch(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIN")
    @ApiBearerAuth()
    @ApiOperation({ summary: "Update a CTA section (Admin only)" })
    update(@Param("id") id: string, @Body() dto: UpdateCtaSectionDto) {
        return this.ctaSectionService.update(id, dto);
    }

    @Get()
    @ApiOperation({ summary: "Get CTA sections filtered by pageType (Public API)" })
    findAll(@Query() query: GetCtaSectionQueryDto) {
        return this.ctaSectionService.findAll(query.pageType);
    }
}
