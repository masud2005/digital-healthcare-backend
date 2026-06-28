import { Roles } from "@common/decorators";
import { JwtAuthGuard, RolesGuard } from "@common/guards";
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
import { CurrentUser } from "@common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "@main/auth/auth.types";
import { BlogsService } from "./blogs.service";
import { CreateBlogDto } from "./dto/create-blog.dto";
import { UpdateBlogDto } from "./dto/update-blog.dto";
import { BlogQueryDto } from "./dto/blog-query.dto";
import { BlogParamDto } from "./dto/blog-param.dto";
import { BlogListResponseDto, BlogResponseDto } from "./dto/blog-response.dto";

@ApiTags("(Admin) Blogs")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
@Controller("admin/blogs")
export class BlogsController {
    constructor(private readonly blogsService: BlogsService) {}

    @Post()
    @ApiOperation({ summary: "Create a blog post" })
    @ApiCreatedResponse({ type: BlogResponseDto })
    create(@Body() payload: CreateBlogDto, @CurrentUser() user: AuthenticatedUser) {
        return this.blogsService.create(payload, user.id);
    }

    @Get()
    @ApiOperation({ summary: "Get paginated blog posts" })
    @ApiOkResponse({ type: BlogListResponseDto })
    findAll(@Query() query: BlogQueryDto) {
        return this.blogsService.findAll(query);
    }

    @Get(":id")
    @ApiOperation({ summary: "Get a blog post by id" })
    @ApiOkResponse({ type: BlogResponseDto })
    findOne(@Param() params: BlogParamDto) {
        return this.blogsService.findOne(params.id);
    }

    @Patch(":id")
    @ApiOperation({ summary: "Update a blog post" })
    @ApiOkResponse({ type: BlogResponseDto })
    update(@Param() params: BlogParamDto, @Body() payload: UpdateBlogDto) {
        return this.blogsService.update(params.id, payload);
    }

    @Delete(":id")
    @HttpCode(204)
    @ApiOperation({ summary: "Delete a blog post" })
    @ApiNoContentResponse({ description: "Blog post deleted successfully" })
    async remove(@Param() params: BlogParamDto) {
        await this.blogsService.remove(params.id);
    }
}
