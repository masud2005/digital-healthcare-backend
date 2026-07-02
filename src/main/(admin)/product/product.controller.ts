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
import { CreateProductDto } from "./dto/create-product.dto";
import { ProductParamDto } from "./dto/product-param.dto";
import { ProductQueryDto } from "./dto/product-query.dto";
import { ProductListResponseDto, ProductResponseDto } from "./dto/product-response.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductService } from "./product.service";

@ApiTags("(Admin) Product")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("admin/products")
export class ProductController {
    constructor(private readonly productService: ProductService) {}

    @Post()
    @RequirePermissions(AppPermission.MANAGE_PRODUCTS)
    @ApiOperation({ summary: "Create a product" })
    @ApiCreatedResponse({ type: ProductResponseDto })
    create(@Body() payload: CreateProductDto) {
        return this.productService.create(payload);
    }

    @Get()
    @RequirePermissions(AppPermission.VIEW_PRODUCTS)
    @ApiOperation({ summary: "Get products" })
    @ApiOkResponse({ type: ProductListResponseDto })
    findAll(@Query() query: ProductQueryDto) {
        return this.productService.findAll(query);
    }

    @Get(":id")
    @RequirePermissions(AppPermission.VIEW_PRODUCTS)
    @ApiOperation({ summary: "Get a product by id" })
    @ApiOkResponse({ type: ProductResponseDto })
    findOne(@Param() params: ProductParamDto) {
        return this.productService.findOne(params.id);
    }

    @Patch(":id")
    @RequirePermissions(AppPermission.MANAGE_PRODUCTS)
    @ApiOperation({ summary: "Update a product" })
    @ApiOkResponse({ type: ProductResponseDto })
    update(@Param() params: ProductParamDto, @Body() payload: UpdateProductDto) {
        return this.productService.update(params.id, payload);
    }

    @Delete(":id")
    @HttpCode(204)
    @RequirePermissions(AppPermission.MANAGE_PRODUCTS)
    @ApiOperation({ summary: "Delete a product" })
    @ApiNoContentResponse({ description: "Product deleted successfully" })
    async remove(@Param() params: ProductParamDto) {
        await this.productService.remove(params.id);
    }
}
