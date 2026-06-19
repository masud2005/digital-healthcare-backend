import { CurrentUser } from "@common/decorators/current-user.decorator";
import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import type { AuthenticatedUser } from "@main/auth/auth.types";
import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
} from "@nestjs/swagger";
import { OrderStatus } from "@prisma/client";
import { MyOrderDetailDto, MyOrderListResponseDto } from "./dto/my-order.dto";
import type { DateRangeFilter } from "./my-order.repository";
import { MyOrderService } from "./my-order.service";

@ApiTags("(Patient) My Orders")
@ApiBearerAuth()
@Controller("my-orders")
export class MyOrderController {
    constructor(private readonly myOrderService: MyOrderService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    @ApiOperation({
        summary: "Get my orders (list view)",
        description:
            "Returns the authenticated patient's orders filtered by status and/or date range. " +
            "Also returns a grouped counts map of all order statuses for tab badges.",
    })
    @ApiOkResponse({ type: MyOrderListResponseDto })
    @ApiQuery({
        name: "status",
        enum: OrderStatus,
        required: false,
        description: "Filter by order status",
    })
    @ApiQuery({
        name: "dateRange",
        enum: ["TODAY", "LAST_7_DAYS", "LAST_MONTH", "LAST_YEAR", "ALL"],
        required: false,
        description: "Filter by date range",
    })
    async getMyOrders(
        @CurrentUser() user: AuthenticatedUser,
        @Query("status") status?: OrderStatus,
        @Query("dateRange") dateRange?: DateRangeFilter,
    ) {
        const result = await this.myOrderService.getMyOrders(user.id, status, dateRange);
        return {
            success: true,
            statusCode: 200,
            message: "Orders retrieved successfully",
            data: result,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Get(":id")
    @ApiOperation({
        summary: "Get a single order detail",
        description:
            "Returns full order detail including items, payment info, shipping address, " +
            "tracking info, and the linked assessment submission.",
    })
    @ApiOkResponse({ type: MyOrderDetailDto })
    async getMyOrderById(
        @Param("id") id: string,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        const order = await this.myOrderService.getMyOrderById(id, user.id);
        return {
            success: true,
            statusCode: 200,
            message: "Order retrieved successfully",
            data: order,
        };
    }
}
