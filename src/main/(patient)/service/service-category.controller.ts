import { Controller, Get, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { ServiceCategoryService } from "./service-category.service";

@ApiTags("(Patient) Service Category")
@Controller("patient/service-category")
export class ServiceCategoryController {
    constructor(private readonly serviceCategoryService: ServiceCategoryService) {}

    @Get()
    @ApiOperation({
        summary: "Get service categories with assessments",
        description:
            "Returns all active categories with their active assessments. " +
            "Filter by category name using the `name` query parameter.",
    })
    @ApiQuery({ name: "name", required: false, description: "Filter by category name" })
    @ApiOkResponse({ description: "List of categories with assessments" })
    getCategories(@Query("name") name?: string) {
        return this.serviceCategoryService.getCategories(name);
    }
}
