import { StorageService } from "@global/storage/storage.service";
import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Patch,
    Post,
    Query,
    UploadedFiles,
    UseInterceptors,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import {
    ApiConsumes,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from "@nestjs/swagger";
import "multer";
import { CreateProductDto } from "./dto/create-product.dto";
import { ProductParamDto } from "./dto/product-param.dto";
import { ProductQueryDto } from "./dto/product-query.dto";
import { ProductListResponseDto, ProductResponseDto } from "./dto/product-response.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductService } from "./product.service";

@ApiTags("Admin Products")
@Controller("admin/products")
export class ProductController {
    constructor(
        private readonly productService: ProductService,
        private readonly storageService: StorageService,
    ) {}

    @Post()
    @ApiOperation({ summary: "Create a product" })
    @ApiConsumes("multipart/form-data")
    @UseInterceptors(FilesInterceptor("images"))
    @ApiCreatedResponse({ type: ProductResponseDto })
    async create(@Body() payload: CreateProductDto, @UploadedFiles() files: Express.Multer.File[]) {
        if (!files || files.length === 0) {
            throw new BadRequestException("At least one product image is required");
        }

        const uploaded = await Promise.all(
            files.map((file) => this.storageService.uploadFile(file)),
        );
        const imageKeys = uploaded.map((img) => img.key);

        return this.productService.create({
            ...payload,
            images: imageKeys,
        });
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
    @ApiConsumes("multipart/form-data")
    @UseInterceptors(FilesInterceptor("images"))
    @ApiOkResponse({ type: ProductResponseDto })
    async update(
        @Param() params: ProductParamDto,
        @Body() payload: UpdateProductDto,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        if (files?.length) {
            const uploaded = await Promise.all(
                files.map((file) => this.storageService.uploadFile(file)),
            );
            payload.images = uploaded.map((img) => img.key);
        }

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
