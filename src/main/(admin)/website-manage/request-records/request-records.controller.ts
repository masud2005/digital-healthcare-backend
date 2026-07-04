import { Roles } from "@common/decorators";
import { JwtAuthGuard, RolesGuard } from "@common/guards";
import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UpdateRequestRecordsDto } from "./dto/update-request-records.dto";
import { RequestRecordsService } from "./request-records.service";

@ApiTags("Website Manage - Request Records")
@Controller("website-manage/request-records")
export class RequestRecordsController {
    constructor(private readonly service: RequestRecordsService) {}

    @Get()
    @ApiOperation({ summary: "Get Request Records widgets (Public API)" })
    get() {
        return this.service.get();
    }

    @Patch()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIN")
    @ApiBearerAuth()
    @ApiOperation({ summary: "Update Request Records widgets (Admin only)" })
    update(@Body() dto: UpdateRequestRecordsDto) {
        return this.service.update(dto);
    }
}
