import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from "@nestjs/common";
import {
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from "@nestjs/swagger";
import { CreateTestimonialDto } from "./dto/create-testimonial.dto";
import { TestimonialParamDto } from "./dto/testimonial-param.dto";
import { TestimonialQueryDto } from "./dto/testimonial-query.dto";
import { TestimonialListResponseDto, TestimonialResponseDto } from "./dto/testimonial-response.dto";
import { UpdateTestimonialDto } from "./dto/update-testimonial.dto";
import { TestimonialService } from "./testimonial.service";

@ApiTags("Admin Testimonials")
@Controller("admin/testimonials")
export class TestimonialController {
    constructor(private readonly testimonialService: TestimonialService) {}

    @Post()
    @ApiOperation({ summary: "Create a testimonial" })
    @ApiCreatedResponse({ type: TestimonialResponseDto })
    create(@Body() payload: CreateTestimonialDto) {
        return this.testimonialService.create(payload);
    }

    @Get()
    @ApiOperation({ summary: "Get testimonials" })
    @ApiOkResponse({ type: TestimonialListResponseDto })
    findAll(@Query() query: TestimonialQueryDto) {
        return this.testimonialService.findAll(query);
    }

    @Get(":id")
    @ApiOperation({ summary: "Get a testimonial by id" })
    @ApiOkResponse({ type: TestimonialResponseDto })
    findOne(@Param() params: TestimonialParamDto) {
        return this.testimonialService.findOne(params.id);
    }

    @Patch(":id")
    @ApiOperation({ summary: "Update a testimonial" })
    @ApiOkResponse({ type: TestimonialResponseDto })
    update(@Param() params: TestimonialParamDto, @Body() payload: UpdateTestimonialDto) {
        return this.testimonialService.update(params.id, payload);
    }

    @Delete(":id")
    @HttpCode(204)
    @ApiOperation({ summary: "Delete a testimonial" })
    @ApiNoContentResponse({ description: "Testimonial deleted successfully" })
    async remove(@Param() params: TestimonialParamDto) {
        await this.testimonialService.remove(params.id);
    }
}
