import { Roles } from "@common/decorators";
import { JwtAuthGuard, RolesGuard } from "@common/guards";
import { StorageService } from "@global/storage/storage.service";
import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
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
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
@Controller("admin/products")
export class ProductController {
    constructor(
        private readonly productService: ProductService,
        private readonly storageService: StorageService,
    ) {}

    @Post()
    @ApiOperation({ summary: "Create a product" })
    @ApiCreatedResponse({ type: ProductResponseDto })
    create(@Body() payload: CreateProductDto) {
        return this.productService.create(payload);
    }

    @Get()
    @ApiOperation({ summary: "Get products" })
    @ApiOkResponse({ type: ProductListResponseDto })
    findAll(@Query() query: ProductQueryDto) {
        return this.productService.findAll(query);
    }

    @Get(":id")
    @ApiOperation({ summary: "Get a product by id" })
    @ApiOkResponse({ type: ProductResponseDto })
    findOne(@Param() params: ProductParamDto) {
        return this.productService.findOne(params.id);
    }

    @Patch(":id")
    @ApiOperation({ summary: "Update a product" })
    @ApiOkResponse({ type: ProductResponseDto })
    update(@Param() params: ProductParamDto, @Body() payload: UpdateProductDto) {
        return this.productService.update(params.id, payload);
    }

    @Delete(":id")
    @HttpCode(204)
    @ApiOperation({ summary: "Delete a product" })
    @ApiNoContentResponse({ description: "Product deleted successfully" })
    async remove(@Param() params: ProductParamDto) {
        await this.productService.remove(params.id);
    }
}
