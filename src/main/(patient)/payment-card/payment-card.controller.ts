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
    constructor(private readonly paymentCardService: PaymentCardService) { }

    @Post()
    @ApiOperation({ summary: "Add a new saved payment card" })
    async createCard(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreatePaymentCardDto) {
        const card = await this.paymentCardService.createCard(user.id, dto);
        return {
            success: true,
            message: "Payment card added successfully",
            data: card
        };
    }

    @Get()
    @ApiOperation({ summary: "Get all saved payment cards" })
    async getMyCards(@CurrentUser() user: AuthenticatedUser) {
        const cards = await this.paymentCardService.getMyCards(user.id);
        return {
            success: true,
            message: "Payment cards fetched successfully",
            data: cards
        };
    }

    @Patch(":id/default")
    @ApiOperation({ summary: "Set a payment card as default" })
    async setDefaultCard(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
        const card = await this.paymentCardService.setDefaultCard(user.id, id);
        return {
            success: true,
            message: "Payment card set as default successfully",
            data: card
        };
    }

    @Delete(":id")
    @ApiOperation({ summary: "Delete a saved payment card" })
    async deleteCard(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
        const card = await this.paymentCardService.deleteCard(user.id, id);
        return {
            success: true,
            message: "Payment card deleted successfully",
            data: card
        };
    }

    @Patch(":id")
    @ApiOperation({ summary: "Update a saved payment card" })
    async updateCard(
        @CurrentUser() user: AuthenticatedUser, 
        @Param("id") id: string,
        @Body() dto: import('./dto/payment-card.dto').UpdatePaymentCardDto
    ) {
        const card = await this.paymentCardService.updateCard(user.id, id, dto);
        return {
            success: true,
            message: "Payment card updated successfully",
            data: card
        };
    }
}
