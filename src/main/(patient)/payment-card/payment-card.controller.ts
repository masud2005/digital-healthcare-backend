import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "@main/auth/auth.types";
import { PaymentCardService } from "./payment-card.service";
import { CreatePaymentCardDto } from "./dto/payment-card.dto";

@ApiTags("Patient Profile - Payment Cards")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("payment-cards")
export class PaymentCardController {
    constructor(private readonly paymentCardService: PaymentCardService) {}

    @Post()
    @ApiOperation({ summary: "Add a new saved payment card" })
    createCard(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreatePaymentCardDto) {
        return this.paymentCardService.createCard(user.id, dto);
    }

    @Get()
    @ApiOperation({ summary: "Get all saved payment cards" })
    getMyCards(@CurrentUser() user: AuthenticatedUser) {
        return this.paymentCardService.getMyCards(user.id);
    }

    @Patch(":id/default")
    @ApiOperation({ summary: "Set a payment card as default" })
    setDefaultCard(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
        return this.paymentCardService.setDefaultCard(user.id, id);
    }

    @Delete(":id")
    @ApiOperation({ summary: "Delete a saved payment card" })
    deleteCard(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
        return this.paymentCardService.deleteCard(user.id, id);
    }
}
