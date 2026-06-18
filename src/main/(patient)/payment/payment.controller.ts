import type { AuthenticatedUser } from "@main/auth/auth.types";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CheckoutDto } from "./dto/checkout.dto";
import { PaymentService } from "./payment.service";

@ApiTags("(Patient) Payment")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("patient/payment")
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {}

    @Post("checkout")
    @ApiOperation({
        summary: "Checkout and pay",
        description:
            "Submit shipping, payment, and compliance info. " +
            "Creates an order, subscription, and updates submission status.",
    })
    @ApiCreatedResponse({ description: "Checkout successful" })
    checkout(@CurrentUser() user: AuthenticatedUser, @Body() dto: CheckoutDto) {
        return this.paymentService.checkout(user.id, dto);
    }
}
