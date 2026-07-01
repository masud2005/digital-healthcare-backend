import { AppPermission } from "@common/auth/permissions.constants";
import { RequirePermissions } from "@common/decorators";
import { JwtAuthGuard, PermissionsGuard } from "@common/guards";
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
    UseGuards,
} from "@nestjs/common";
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
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("admin/categories")
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    // Create a category
    @Post()
    @RequirePermissions(AppPermission.MANAGE_SERVICE_CATEGORIES_AND_PLANS)
    @ApiOperation({ summary: "Create a category" })
    @ApiCreatedResponse({ type: CategoryResponseDto })
    create(@Body() payload: CreateCategoryDto) {
        return this.categoryService.create(payload);
    }

    @Get()
    @RequirePermissions(AppPermission.VIEW_SERVICE_CATEGORIES_AND_PLANS)
    @ApiOperation({ summary: "Get categories" })
    @ApiOkResponse({ type: CategoryListResponseDto })
    findAll(@Query() query: CategoryQueryDto) {
        return this.categoryService.findAll(query);
    }

    @Get(":id")
    @RequirePermissions(AppPermission.VIEW_SERVICE_CATEGORIES_AND_PLANS)
    @ApiOperation({ summary: "Get a category by id" })
    @ApiOkResponse({ type: CategoryResponseDto })
    findOne(@Param() params: CategoryParamDto) {
        return this.categoryService.findOne(params.id);
    }

    @Patch(":id")
    @RequirePermissions(AppPermission.MANAGE_SERVICE_CATEGORIES_AND_PLANS)
    @ApiOperation({ summary: "Update a category" })
    @ApiOkResponse({ type: CategoryResponseDto })
    update(@Param() params: CategoryParamDto, @Body() payload: UpdateCategoryDto) {
        return this.categoryService.update(params.id, payload);
    }

    @Delete(":id")
    @HttpCode(204)
    @RequirePermissions(AppPermission.MANAGE_SERVICE_CATEGORIES_AND_PLANS)
    @ApiOperation({ summary: "Delete a category" })
    @ApiNoContentResponse({ description: "Category deleted successfully" })
    async remove(@Param() params: CategoryParamDto) {
        await this.categoryService.remove(params.id);
    }
}
