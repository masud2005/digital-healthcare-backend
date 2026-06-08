import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from "@nestjs/common";
import {
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from "@nestjs/swagger";
import { DiscountService } from "./discount.service";
import { CreateDiscountDto } from "./dto/create-discount.dto";
import { DiscountParamDto } from "./dto/discount-param.dto";
import { DiscountQueryDto } from "./dto/discount-query.dto";
import { DiscountListResponseDto, DiscountResponseDto } from "./dto/discount-response.dto";
import { UpdateDiscountDto } from "./dto/update-discount.dto";

@ApiTags("Admin Discounts")
@Controller("admin/discounts")
export class DiscountController {
    constructor(private readonly discountService: DiscountService) {}

    @Post()
    @ApiOperation({ summary: "Create a discount" })
    @ApiCreatedResponse({ type: DiscountResponseDto })
    create(@Body() payload: CreateDiscountDto) {
        return this.discountService.create(payload);
    }

    @Get()
    @ApiOperation({ summary: "Get discounts" })
    @ApiOkResponse({ type: DiscountListResponseDto })
    findAll(@Query() query: DiscountQueryDto) {
        return this.discountService.findAll(query);
    }

    @Get(":id")
    @ApiOperation({ summary: "Get a discount by id" })
    @ApiOkResponse({ type: DiscountResponseDto })
    findOne(@Param() params: DiscountParamDto) {
        return this.discountService.findOne(params.id);
    }

    @Patch(":id")
    @ApiOperation({ summary: "Update a discount" })
    @ApiOkResponse({ type: DiscountResponseDto })
    update(@Param() params: DiscountParamDto, @Body() payload: UpdateDiscountDto) {
        return this.discountService.update(params.id, payload);
    }

    @Delete(":id")
    @HttpCode(204)
    @ApiOperation({ summary: "Delete a discount" })
    @ApiNoContentResponse({ description: "Discount deleted successfully" })
    async remove(@Param() params: DiscountParamDto) {
        await this.discountService.remove(params.id);
    }
}
