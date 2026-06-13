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
    UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
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
    @ApiOperation({ summary: "Create an assessment" })
    @ApiConsumes("multipart/form-data")
    @UseInterceptors(FileInterceptor("thumbnail"))
    @ApiCreatedResponse({ type: AssessmentResponseDto })
    async create(
        @Body() payload: CreateAssessmentDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
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
    @ApiOperation({ summary: "Get all assessments" })
    @ApiOkResponse({ type: AssessmentListResponseDto })
    findAll(@Query() query: AssessmentQueryDto) {
        return this.assessmentService.findAll(query);
    }

    @Get("stats")
    @ApiOperation({ summary: "Get assessment stats" })
    @ApiOkResponse({ type: AssessmentStatsResponseDto })
    findStats() {
        return this.assessmentService.findStats();
    }

    @Get(":id")
    @ApiOperation({ summary: "Get an assessment by id" })
    @ApiOkResponse({ type: AssessmentResponseDto })
    findOne(@Param() params: AssessmentParamDto) {
        return this.assessmentService.findOne(params.id);
    }

    @Patch(":id")
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
    @HttpCode(204)
    @ApiOperation({ summary: "Delete an assessment" })
    @ApiNoContentResponse({ description: "Assessment deleted successfully" })
    async remove(@Param() params: AssessmentParamDto) {
        await this.assessmentService.remove(params.id);
    }
}