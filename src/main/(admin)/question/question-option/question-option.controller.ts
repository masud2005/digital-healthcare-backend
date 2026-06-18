import { Roles } from "@common/decorators";
import { JwtAuthGuard, RolesGuard } from "@common/guards";
import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from "@nestjs/swagger";
import { CreateQuestionOptionDto } from "./dto/create-question-option.dto";
import { QuestionOptionParamDto } from "./dto/question-option-param.dto";
import { QuestionOptionQueryDto } from "./dto/question-option-query.dto";
import {
    QuestionOptionListResponseDto,
    QuestionOptionResponseDto,
} from "./dto/question-option-response.dto";
import { UpdateQuestionOptionDto } from "./dto/update-question-option.dto";
import { QuestionOptionService } from "./question-option.service";

@ApiTags("(Admin) Question Option")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
@Controller("admin/question-options")
export class QuestionOptionController {
    constructor(private readonly questionOptionService: QuestionOptionService) {}

    @Post()
    @ApiOperation({ summary: "Create a question option" })
    @ApiCreatedResponse({ type: QuestionOptionResponseDto })
    create(@Body() payload: CreateQuestionOptionDto) {
        return this.questionOptionService.create(payload);
    }

    @Get()
    @ApiOperation({ summary: "Get question options" })
    @ApiOkResponse({ type: QuestionOptionListResponseDto })
    findAll(@Query() query: QuestionOptionQueryDto) {
        return this.questionOptionService.findAll(query);
    }

    @Get(":id")
    @ApiOperation({ summary: "Get a question option by id" })
    @ApiOkResponse({ type: QuestionOptionResponseDto })
    findOne(@Param() params: QuestionOptionParamDto) {
        return this.questionOptionService.findOne(params.id);
    }

    @Patch(":id")
    @ApiOperation({ summary: "Update a question option" })
    @ApiOkResponse({ type: QuestionOptionResponseDto })
    update(@Param() params: QuestionOptionParamDto, @Body() payload: UpdateQuestionOptionDto) {
        return this.questionOptionService.update(params.id, payload);
    }

    @Delete(":id")
    @HttpCode(204)
    @ApiOperation({ summary: "Delete a question option" })
    @ApiNoContentResponse({ description: "Question option deleted successfully" })
    remove(@Param() params: QuestionOptionParamDto) {
        return this.questionOptionService.remove(params.id);
    }
}
