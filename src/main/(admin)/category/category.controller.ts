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
import { CategoryService } from "./category.service";
import { CategoryParamDto } from "./dto/category-param.dto";
import { CategoryQueryDto } from "./dto/category-query.dto";
import { CategoryListResponseDto, CategoryResponseDto } from "./dto/category-response.dto";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@ApiTags("(Admin) Category")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
@Controller("admin/categories")
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    @Post()
    @ApiOperation({ summary: "Create a category" })
    @ApiCreatedResponse({ type: CategoryResponseDto })
    create(@Body() payload: CreateCategoryDto) {
        return this.categoryService.create(payload);
    }

    @Get()
    @ApiOperation({ summary: "Get categories" })
    @ApiOkResponse({ type: CategoryListResponseDto })
    findAll(@Query() query: CategoryQueryDto) {
        return this.categoryService.findAll(query);
    }

    @Get(":id")
    @ApiOperation({ summary: "Get a category by id" })
    @ApiOkResponse({ type: CategoryResponseDto })
    findOne(@Param() params: CategoryParamDto) {
        return this.categoryService.findOne(params.id);
    }

    @Patch(":id")
    @ApiOperation({ summary: "Update a category" })
    @ApiOkResponse({ type: CategoryResponseDto })
    update(@Param() params: CategoryParamDto, @Body() payload: UpdateCategoryDto) {
        return this.categoryService.update(params.id, payload);
    }

    @Delete(":id")
    @HttpCode(204)
    @ApiOperation({ summary: "Delete a category" })
    @ApiNoContentResponse({ description: "Category deleted successfully" })
    async remove(@Param() params: CategoryParamDto) {
        await this.categoryService.remove(params.id);
    }
}
