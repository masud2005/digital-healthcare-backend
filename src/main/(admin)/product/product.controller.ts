import { StorageService } from "@global/storage/storage.service";
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
    UploadedFile,
    UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
    ApiBody,
    ApiConsumes,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiOperation,
    ApiProperty,
    ApiTags,
} from "@nestjs/swagger";
import { CreateProductDto } from "./dto/create-product.dto";
import { ProductParamDto } from "./dto/product-param.dto";
import { ProductQueryDto } from "./dto/product-query.dto";
import { ProductListResponseDto, ProductResponseDto } from "./dto/product-response.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductService } from "./product.service";

class UploadFileDto {
    @ApiProperty({
        type: "string",
        format: "binary",
        description: "File to upload (image/document)",
    })
    file: any;
}

@ApiTags("Admin Products")
@Controller("admin/products")
export class ProductController {
    constructor(
        private readonly productService: ProductService,
        private readonly storageService: StorageService,
    ) {}

    @ApiBody({
        description: "Upload file",
        type: UploadFileDto,
    })
    @ApiConsumes("multipart/form-data")
    @Post("upload")
    @UseInterceptors(FileInterceptor("file"))
    async upload(@UploadedFile() file: Express.Multer.File) {
        return this.storageService.uploadFile(file);
    }

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
