import { Roles } from "@common/decorators";
import { JwtAuthGuard, RolesGuard } from "@common/guards";
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
import { CreateQuestionDto } from "./dto/create-question.dto";
import { QuestionParamDto } from "./dto/question-param.dto";
import { QuestionQueryDto } from "./dto/question-query.dto";
import { QuestionListResponseDto, QuestionResponseDto } from "./dto/question-response.dto";
import { UpdateQuestionDto } from "./dto/update-question.dto";
import { QuestionService } from "./question.service";

@ApiTags("(Admin) Question")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
@Controller("admin/questions")
export class QuestionController {
    constructor(
        private readonly questionService: QuestionService,
        private readonly storageService: StorageService,
    ) {}

    @Post()
    @ApiOperation({ summary: "Create a question" })
    @ApiConsumes("multipart/form-data")
    @UseInterceptors(FileInterceptor("media"))
    @ApiCreatedResponse({ type: QuestionResponseDto })
    async create(@Body() payload: CreateQuestionDto, @UploadedFile() file?: any) {
        if (file) {
            const uploaded = await this.storageService.uploadFile(file);

            return this.questionService.create({
                ...payload,
                media: uploaded.key,
            });
        }

        return this.questionService.create(payload);
    }

    @Get()
    @ApiOperation({ summary: "Get questions" })
    @ApiOkResponse({ type: QuestionListResponseDto })
    findAll(@Query() query: QuestionQueryDto) {
        return this.questionService.findAll(query);
    }

    @Get(":id")
    @ApiOperation({ summary: "Get a question by id" })
    @ApiOkResponse({ type: QuestionResponseDto })
    findOne(@Param() params: QuestionParamDto) {
        return this.questionService.findOne(params.id);
    }

    @Patch(":id")
    @ApiOperation({ summary: "Update a question" })
    @ApiConsumes("multipart/form-data")
    @UseInterceptors(FileInterceptor("media"))
    @ApiOkResponse({ type: QuestionResponseDto })
    async update(
        @Param() params: QuestionParamDto,
        @Body() payload: UpdateQuestionDto,
        @UploadedFile() file?: any,
    ) {
        if (file) {
            const uploaded = await this.storageService.uploadFile(file);

            return this.questionService.update(params.id, {
                ...payload,
                media: uploaded.key,
            });
        }

        return this.questionService.update(params.id, payload);
    }

    @Delete(":id")
    @HttpCode(204)
    @ApiOperation({ summary: "Delete a question" })
    @ApiNoContentResponse({ description: "Question deleted successfully" })
    remove(@Param() params: QuestionParamDto) {
        return this.questionService.remove(params.id);
    }
}
