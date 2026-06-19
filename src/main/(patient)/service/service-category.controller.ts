import { BadRequestException, Controller, Get, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { ServiceCategoryService } from "./service-category.service";

@ApiTags("(Patient) Service Category")
@Controller("patient")
export class ServiceCategoryController {
    constructor(private readonly serviceCategoryService: ServiceCategoryService) {}

    @Get("categories-names")
    @ApiOperation({
        summary: "Get all service categories",
        description: "Returns all active categories",
    })
    @ApiOkResponse({ description: "List of all categories" })
    async getAllCategoriesName() {
        const categories = await this.serviceCategoryService.getAllCategoriesName();
        return {
            success: true,
            statusCode: 200,
            message: "All Categories names retrieved successfully",
            data: categories,
        };
    }

    @Get("categories")
    @ApiOperation({
        summary: "Get service categories with assessments",
        description:
            "Returns all active categories with their active assessments. " +
            "Filter by category name using the `name` query parameter.",
    })
    @ApiQuery({ name: "name", required: false, description: "Filter by category name" })
    @ApiOkResponse({ description: "List of categories with assessments" })
    async getCategories(@Query("name") name?: string) {
        const categories = await this.serviceCategoryService.getCategories(name);
        return {
            success: true,
            statusCode: 200,
            message: "Categories retrieved successfully",
            data: categories,
        };
    }

    @Get("products-names")
    @ApiOperation({
        summary: "Get products by category",
        description: "Returns id and name of products belonging to a specific category.",
    })
    @ApiQuery({ name: "categoryId", required: true, description: "Category ID to filter by" })
    @ApiOkResponse({ description: "List of products (id, name)" })
    async getProductsByCategory(@Query("categoryId") categoryId: string) {
        if (!categoryId) {
            throw new BadRequestException("categoryId is required");
        }
        const products = await this.serviceCategoryService.getProductsByCategory(categoryId);
        return {
            success: true,
            statusCode: 200,
            message: "Products retrieved successfully",
            data: products,
        };
    }
}
