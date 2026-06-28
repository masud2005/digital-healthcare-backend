import { BadRequestException, Controller, Get, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { PublicProductService } from "./public-product.service";

@ApiTags("(Patient) Service Wise Products")
@Controller("patient/products")
export class PublicProductController {
    constructor(private readonly publicProductService: PublicProductService) {}

    @Get()
    @ApiOperation({
        summary: "Get products by category id (required)",
        description:
            "Returns products of the matched active category. The `categoryId` query param is mandatory.",
    })
    @ApiQuery({ name: "categoryId", required: true, description: "Category ID to filter by" })
    @ApiOkResponse({ description: "Products of the given category" })
    getProducts(@Query("categoryId") categoryId: string) {
        if (!categoryId?.trim()) {
            throw new BadRequestException("categoryId query param is required");
        }

        return this.publicProductService.getProducts(categoryId.trim());
    }
}
