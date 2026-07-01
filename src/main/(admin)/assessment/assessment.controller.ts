import { AppPermission } from "@common/auth/permissions.constants";
import { RequirePermissions } from "@common/decorators";
import { JwtAuthGuard, PermissionsGuard } from "@common/guards";
import { StorageService } from "@global/storage/storage.service";
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Patch,
    Post,
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
    ApiBearerAuth,
    ApiConsumes,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from "@nestjs/swagger";
import "multer";
import { AssessmentService } from "./assessment.service";
import { AssessmentParamDto } from "./dto/assessment-param.dto";
import { AssessmentQueryDto } from "./dto/assessment-query.dto";
import {
    AssessmentListResponseDto,
    AssessmentResponseDto,
    AssessmentStatsResponseDto,
} from "./dto/assessment-response.dto";
import { CreateAssessmentDto } from "./dto/create-assessment.dto";
import { UpdateAssessmentDto } from "./dto/update-assessment.dto";

@ApiTags("(Admin) Assessment")
@Controller("admin/assessments")
export class AssessmentController {
    constructor(
        private readonly assessmentService: AssessmentService,
        private readonly storageService: StorageService,
    ) {}

    @Post()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions(AppPermission.MANAGE_ASSESSMENTS)
    @ApiOperation({ summary: "Create an assessment" })
    @ApiConsumes("multipart/form-data")
    @UseInterceptors(FileInterceptor("thumbnail"))
    @ApiCreatedResponse({ type: AssessmentResponseDto })
    async create(@Body() payload: CreateAssessmentDto, @UploadedFile() file?: Express.Multer.File) {
        if (file) {
            const uploaded = await this.storageService.uploadFile(file);

            return this.assessmentService.create({
                ...payload,
                thumbnail: uploaded.key,
            });
        }

        return this.assessmentService.create(payload);
    }

    @Get()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions(AppPermission.VIEW_ASSESSMENTS)
    @ApiOperation({ summary: "Get all assessments" })
    @ApiOkResponse({ type: AssessmentListResponseDto })
    findAll(@Query() query: AssessmentQueryDto) {
        return this.assessmentService.findAll(query);
    }

    @Get("stats")
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions(AppPermission.VIEW_ASSESSMENTS)
    @ApiOperation({ summary: "Get assessment stats" })
    @ApiOkResponse({ type: AssessmentStatsResponseDto })
    findStats() {
        return this.assessmentService.findStats();
    }

    // Public — used by the patient-facing assessment flow
    @Get(":id")
    @ApiOperation({ summary: "Get an assessment by id (Public)" })
    @ApiOkResponse({ type: AssessmentResponseDto })
    findOne(@Param() params: AssessmentParamDto) {
        return this.assessmentService.findOne(params.id);
    }

    @Patch(":id")
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions(AppPermission.MANAGE_ASSESSMENTS)
    @ApiOperation({ summary: "Update an assessment" })
    @ApiConsumes("multipart/form-data")
    @UseInterceptors(FileInterceptor("thumbnail"))
    @ApiOkResponse({ type: AssessmentResponseDto })
    async update(
        @Param() params: AssessmentParamDto,
        @Body() payload: UpdateAssessmentDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        if (file) {
            const uploaded = await this.storageService.uploadFile(file);

            return this.assessmentService.update(params.id, {
                ...payload,
                thumbnail: uploaded.key,
            });
        }

        return this.assessmentService.update(params.id, payload);
    }

    @Delete(":id")
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions(AppPermission.MANAGE_ASSESSMENTS)
    @HttpCode(204)
    @ApiOperation({ summary: "Delete an assessment" })
    @ApiNoContentResponse({ description: "Assessment deleted successfully" })
    async remove(@Param() params: AssessmentParamDto) {
        await this.assessmentService.remove(params.id);
    }
}
