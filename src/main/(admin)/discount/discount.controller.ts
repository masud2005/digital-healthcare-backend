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
import { DiscountService } from "./discount.service";
import { CreateDiscountDto } from "./dto/create-discount.dto";
import { DiscountParamDto } from "./dto/discount-param.dto";
import { DiscountQueryDto } from "./dto/discount-query.dto";
import { DiscountListResponseDto, DiscountResponseDto } from "./dto/discount-response.dto";
import { UpdateDiscountDto } from "./dto/update-discount.dto";

@ApiTags("(Admin) Discount")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("admin/discounts")
export class DiscountController {
    constructor(private readonly discountService: DiscountService) {}

    @Post()
    @RequirePermissions(AppPermission.MANAGE_DISCOUNTS_AND_MARKETING)
    @ApiOperation({ summary: "Create a discount" })
    @ApiCreatedResponse({ type: DiscountResponseDto })
    create(@Body() payload: CreateDiscountDto) {
        return this.discountService.create(payload);
    }

    @Get()
    @RequirePermissions(AppPermission.VIEW_DISCOUNTS_AND_MARKETING)
    @ApiOperation({ summary: "Get discounts" })
    @ApiOkResponse({ type: DiscountListResponseDto })
    findAll(@Query() query: DiscountQueryDto) {
        return this.discountService.findAll(query);
    }

    @Get(":id")
    @RequirePermissions(AppPermission.VIEW_DISCOUNTS_AND_MARKETING)
    @ApiOperation({ summary: "Get a discount by id" })
    @ApiOkResponse({ type: DiscountResponseDto })
    findOne(@Param() params: DiscountParamDto) {
        return this.discountService.findOne(params.id);
    }

    @Patch(":id")
    @RequirePermissions(AppPermission.MANAGE_DISCOUNTS_AND_MARKETING)
    @ApiOperation({ summary: "Update a discount" })
    @ApiOkResponse({ type: DiscountResponseDto })
    update(@Param() params: DiscountParamDto, @Body() payload: UpdateDiscountDto) {
        return this.discountService.update(params.id, payload);
    }

    @Delete(":id")
    @HttpCode(204)
    @RequirePermissions(AppPermission.MANAGE_DISCOUNTS_AND_MARKETING)
    @ApiOperation({ summary: "Delete a discount" })
    @ApiNoContentResponse({ description: "Discount deleted successfully" })
    async remove(@Param() params: DiscountParamDto) {
        await this.discountService.remove(params.id);
    }
}
