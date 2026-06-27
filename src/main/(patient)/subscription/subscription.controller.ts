import { CurrentUser } from "@common/decorators/current-user.decorator";
import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import type { AuthenticatedUser } from "@main/auth/auth.types";
import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ToggleRecurringDto } from "./dto/toggle-recurring.dto";
import { SubscriptionService } from "./subscription.service";

@ApiTags("(Patient) Subscription")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("patient/subscriptions")
export class SubscriptionController {
    constructor(private readonly subscriptionService: SubscriptionService) {}

    @Get()
    @ApiOperation({
        summary: "Get my subscriptions",
        description: "Returns all subscriptions belonging to the authenticated patient, with payment history.",
    })
    @ApiOkResponse({ description: "List of patient subscriptions" })
    async getMySubscriptions(@CurrentUser() user: AuthenticatedUser) {
        const data = await this.subscriptionService.getMySubscriptions(user.id);
        return {
            success: true,
            statusCode: 200,
            message: "Subscriptions retrieved successfully",
            data,
        };
    }

    @Get(":id")
    @ApiOperation({
        summary: "Get a single subscription",
        description: "Returns details of a specific subscription by ID (must belong to the authenticated patient).",
    })
    @ApiOkResponse({ description: "Subscription details" })
    async getMySubscriptionById(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
        const data = await this.subscriptionService.getMySubscriptionById(id, user.id);
        return {
            success: true,
            statusCode: 200,
            message: "Subscription retrieved successfully",
            data,
        };
    }

    @Patch(":id/toggle-recurring")
    @ApiOperation({
        summary: "Toggle auto-renewal (recurring) on/off",
        description:
            "Enables or disables automatic recurring billing for a subscription. " +
            "When disabled, the subscription stays active until the current billing period ends, then expires. " +
            "When re-enabled, the subscription will auto-renew on the next billing date.",
    })
    @ApiOkResponse({ description: "Recurring status updated" })
    async toggleRecurring(
        @CurrentUser() user: AuthenticatedUser,
        @Param("id") id: string,
        @Body() dto: ToggleRecurringDto,
    ) {
        const data = await this.subscriptionService.toggleRecurring(id, user.id, dto.isRecurring);
        return {
            success: true,
            statusCode: 200,
            message: data.message,
            data: {
                id: data.id,
                isRecurring: data.isRecurring,
                status: data.status,
                nextBillingDate: data.nextBillingDate,
            },
        };
    }
}
