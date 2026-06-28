import { Roles } from "@common/decorators";
import { JwtAuthGuard, RolesGuard } from "@common/guards";
import { Controller, Get, HttpStatus, Param, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { PaymentDetailDto, PaymentListResponseDto, PaymentQueryDto } from "./dto/payment.dto";
import { AdminPaymentService } from "./payment.service";

@ApiTags("(Admin) Payments")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
@Controller("admin/payments")
export class AdminPaymentController {
    constructor(private readonly paymentService: AdminPaymentService) {}

    @Get()
    @ApiOperation({
        summary: "Get all payments (paginated, searchable, filterable)",
        description:
            "Returns a paginated list of payments. Supports searching by patient name and filtering by paymentType and status.",
    })
    @ApiOkResponse({ type: PaymentListResponseDto })
    async findAll(@Query() query: PaymentQueryDto) {
        const result = await this.paymentService.findAll(query);
        return {
            success: true,
            statusCode: HttpStatus.OK,
            message: "Payments retrieved successfully",
            ...result,
        };
    }

    @Get(":id")
    @ApiOperation({
        summary: "Get a single payment by ID",
        description:
            "Returns detailed information about a single payment including related user, order, and subscription.",
    })
    @ApiOkResponse({ type: PaymentDetailDto })
    async findById(@Param("id") id: string) {
        const data = await this.paymentService.findById(id);
        return {
            success: true,
            statusCode: HttpStatus.OK,
            message: "Payment retrieved successfully",
            data,
        };
    }
}
