import { Roles } from "@common/decorators";
import { JwtAuthGuard, RolesGuard } from "@common/guards";
import { Body, Controller, Get, HttpStatus, Param, Patch, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { OrderDetailResponseDto, OrderListResponseDto, OrderQueryDto, UpdateOrderDto } from "./dto/order.dto";
import { AdminOrderService } from "./order.service";

@ApiTags("(Admin) Orders")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
@Controller("admin/orders")
export class AdminOrderController {
    constructor(private readonly orderService: AdminOrderService) {}

    @Get()
    @ApiOperation({
        summary: "Get all orders (paginated, searchable, filterable)",
        description: "Returns a paginated list of orders. Supports searching by orderId and filtering by status, doctorName, and dateRange.",
    })
    @ApiOkResponse({ type: OrderListResponseDto })
    async findAll(@Query() query: OrderQueryDto) {
        const result = await this.orderService.findAll(query);
        return {
            success: true,
            statusCode: HttpStatus.OK,
            message: "Orders retrieved successfully",
            ...result,
        };
    }

    @Get(":id")
    @ApiOperation({
        summary: "Get a single order by ID",
        description: "Returns detailed information about a single order including items, shipping, and payment details.",
    })
    @ApiOkResponse({ type: OrderDetailResponseDto })
    async findById(@Param("id") id: string) {
        const data = await this.orderService.findById(id);
        return {
            success: true,
            statusCode: HttpStatus.OK,
            message: "Order retrieved successfully",
            data,
        };
    }

    @Patch(":id")
    @ApiOperation({
        summary: "Update an order",
        description: "Update the status, trackingNumber, or trackingCarrier of an order.",
    })
    async update(@Param("id") id: string, @Body() dto: UpdateOrderDto) {
        const result = await this.orderService.update(id, dto);
        return {
            success: true,
            statusCode: HttpStatus.OK,
            ...result,
        };
    }
}
