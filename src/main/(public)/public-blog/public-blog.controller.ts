import { Controller, Get, HttpStatus, Param, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { BlogsService } from "../../(admin)/blogs/blogs.service";
import { BlogQueryDto } from "../../(admin)/blogs/dto/blog-query.dto";
import { BlogListResponseDto, BlogResponseDto } from "../../(admin)/blogs/dto/blog-response.dto";

@ApiTags("(Public) Blogs")
@Controller("public/blogs")
export class PublicBlogController {
    constructor(private readonly blogsService: BlogsService) {}

    @Get()
    @ApiOperation({ summary: "Get all published blogs for the public website" })
    @ApiOkResponse({ type: BlogListResponseDto })
    async getPublishedBlogs(@Query() query: BlogQueryDto) {
        query.isPublished = true;
        const data = await this.blogsService.findAll(query);
        return {
            success: true,
            statusCode: HttpStatus.OK,
            message: "Published blogs fetched successfully",
            ...data,
        };
    }

    //
    @Get(":idOrSlug")
    @ApiOperation({ summary: "Get a single published blog by ID or Slug" })
    @ApiOkResponse({ type: BlogResponseDto })
    async getBlog(@Param("idOrSlug") idOrSlug: string) {
        const data = await this.blogsService.findOneByIdOrSlug(idOrSlug);
        return {
            success: true,
            statusCode: HttpStatus.OK,
            message: "Blog fetched successfully",
            data,
        };
    }
}
