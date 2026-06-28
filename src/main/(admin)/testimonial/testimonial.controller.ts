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
    Res,
} from "@nestjs/common";
import {
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiOperation,
    ApiProduces,
    ApiQuery,
    ApiTags,
} from "@nestjs/swagger";
import type { Response } from "express";
import { CreateTestimonialDto } from "./dto/create-testimonial.dto";
import { TestimonialParamDto } from "./dto/testimonial-param.dto";
import { TestimonialQueryDto } from "./dto/testimonial-query.dto";
import { TestimonialListResponseDto, TestimonialResponseDto } from "./dto/testimonial-response.dto";
import { UpdateTestimonialDto } from "./dto/update-testimonial.dto";
import { TestimonialService } from "./testimonial.service";

@ApiTags("(Admin) Testimonial")
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

    @Get("export")
    @ApiOperation({ summary: "Export testimonials as CSV" })
    @ApiProduces("text/csv")
    @ApiQuery({ name: "search", required: false })
    @ApiQuery({ name: "isPublished", required: false, type: Boolean })
    @ApiQuery({ name: "minRating", required: false, type: Number })
    @ApiQuery({ name: "maxRating", required: false, type: Number })
    @ApiQuery({ name: "fromDate", required: false })
    @ApiQuery({ name: "toDate", required: false })
    async export(
        @Query("search") search?: string,
        @Query("isPublished") isPublished?: string,
        @Query("minRating") minRating?: string,
        @Query("maxRating") maxRating?: string,
        @Query("fromDate") fromDate?: string,
        @Query("toDate") toDate?: string,
        @Res({ passthrough: false }) res?: Response,
    ) {
        const parseBool = (val?: string): boolean | undefined => {
            if (val === "true") return true;
            if (val === "false") return false;
            return undefined;
        };

        const parseNum = (val?: string): number | undefined => {
            if (val === undefined || val === null || val === "") return undefined;
            const parsed = Number(val);
            return isNaN(parsed) ? undefined : parsed;
        };

        const csvContent = await this.testimonialService.exportCsv({
            search,
            isPublished: parseBool(isPublished),
            minRating: parseNum(minRating),
            maxRating: parseNum(maxRating),
            fromDate,
            toDate,
        });

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
        const filename = `testimonials-${timestamp}.csv`;

        res!.setHeader("Content-Type", "text/csv; charset=utf-8");
        res!.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res!.setHeader("Cache-Control", "no-cache");
        res!.send(csvContent);
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
