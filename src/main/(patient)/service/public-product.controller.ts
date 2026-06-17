import { BadRequestException, Controller, Get, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { PublicProductService } from "./public-product.service";

@ApiTags("(Patient) Service Wise Products")
@Controller("patient/products")
export class PublicProductController {
    constructor(private readonly publicProductService: PublicProductService) {}

    @Get()
    @ApiOperation({
        summary: "Get products by category name (required)",
        description: "Returns products of the matched active category. The `category` query param is mandatory.",
    })
    @ApiQuery({ name: "category", required: true, description: "Category name to filter by" })
    @ApiOkResponse({ description: "Products of the given category" })
    getProducts(@Query("category") category: string) {
        if (!category?.trim()) {
            throw new BadRequestException("category query param is required");
        }

        return this.publicProductService.getProducts(category.trim());
    }
}
