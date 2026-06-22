import { Roles } from "@common/decorators";
import { JwtAuthGuard, RolesGuard } from "@common/guards";
import { Controller, Get, HttpStatus, Param, ParseUUIDPipe, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { DocumentCenterService } from "./document-center.service";
import { DocumentQueryDto } from "./dto/document-query.dto";

@ApiTags("(Admin) Document Center")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
@Controller("admin/documents")
export class DocumentCenterController {
    constructor(private readonly documentCenterService: DocumentCenterService) {}

    @Get("stats")
    @ApiOperation({ summary: "Get document count grouped by type" })
    async getStats() {
        const result = await this.documentCenterService.getStats();
        return {
            success: true,
            statusCode: HttpStatus.OK,
            message: "Document stats fetched successfully",
            ...result,
        };
    }

    @Get()
    @ApiOperation({ summary: "Get all documents with search and filter" })
    async findAll(@Query() query: DocumentQueryDto) {
        const result = await this.documentCenterService.findAll(query);
        return {
            success: true,
            statusCode: HttpStatus.OK,
            message: "Documents fetched successfully",
            ...result,
        };
    }

    @Get(":id")
    @ApiOperation({ summary: "Get a single document by id" })
    async findById(@Param("id", ParseUUIDPipe) id: string) {
        const data = await this.documentCenterService.findById(id);
        return {
            success: true,
            statusCode: HttpStatus.OK,
            message: "Document fetched successfully",
            data,
        };
    }
}
