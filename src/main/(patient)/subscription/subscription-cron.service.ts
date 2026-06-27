import { CloverService } from "@global/clover/clover.service";
import { PrismaService } from "@global/prisma/prisma.service";
import { NotificationService } from "@main/notification/notification.service";
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class SubscriptionCronService {
    private readonly logger = new Logger(SubscriptionCronService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly cloverService: CloverService,
        private readonly notificationService: NotificationService,
    ) {}

    /**
     * Runs every day at 1:00 AM server time.
     * Finds active, recurring subscriptions whose nextBillingDate is today or earlier.
     */
    @Cron(CronExpression.EVERY_DAY_AT_1AM)
    async handleRecurringPayments() {
        this.logger.log("🔄 Starting daily recurring subscription billing process...");

        const dueSubscriptions = await this.prisma.subscription.findMany({
            where: {
                isRecurring: true,
                status: "ACTIVE",
                cloverCardToken: { not: null },
                nextBillingDate: { lte: new Date() },
            },
            include: {
                paymentPlan: true,
                user: {
                    select: {
                        name: true,
                        patientProfile: { select: { name: true } },
                    },
                },
                category: { select: { name: true } },
            },
        });

        if (dueSubscriptions.length === 0) {
            this.logger.log("✅ No subscriptions are due for billing today.");
            return;
        }

        this.logger.log(`⏳ Found ${dueSubscriptions.length} subscriptions due for billing.`);

        for (const subscription of dueSubscriptions) {
            try {
                this.logger.log(`💳 Attempting to charge subscription ${subscription.id} for user ${subscription.userId}...`);

                // 1. Charge the saved card token
                const chargeResult = await this.cloverService.chargeWithSavedToken({
                    savedToken: subscription.cloverCardToken!,
                    totalAmountUSD: Number(subscription.paymentPlan.price),
                    description: `Doc App Recurring Subscription - ${subscription.category.name}`,
                });

                // 2. Calculate next billing dates
                const nextBillingDate = new Date(subscription.nextBillingDate || new Date());
                const cycle = subscription.paymentPlan.billingCycle;

                if (cycle === "MONTHLY") {
                    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
                } else if (cycle === "YEARLY") {
                    nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
                } else if (cycle === "QUARTERLY") {
                    nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
                }

                // 3. Database Transaction (Update Subscription & Create Payment Record)
                await this.prisma.$transaction(async (tx) => {
                    // Create payment record
                    await tx.payment.create({
                        data: {
                            transactionId: chargeResult.id,
                            amount: Number(subscription.paymentPlan.price),
                            currency: "USD",
                            status: "COMPLETED",
                            method: "CLOVER",
                            last4: chargeResult.last4,
                            brand: chargeResult.brand,
                            paymentType: ["FEES"],
                            paidAt: new Date(),
                            userId: subscription.userId,
                            subscriptionId: subscription.id,
                        },
                    });

                    // Update subscription period
                    await tx.subscription.update({
                        where: { id: subscription.id },
                        data: {
                            currentPeriodStart: subscription.nextBillingDate,
                            currentPeriodEnd: nextBillingDate,
                            nextBillingDate: nextBillingDate,
                        },
                    });
                });

                // 4. Notify User
                const patientName = subscription.user.patientProfile?.name || subscription.user.name || "Patient";
                await this.notificationService.send({
                    userId: subscription.userId,
                    title: "Subscription Renewed",
                    message: `Hi ${patientName}, your subscription for ${subscription.category.name} has been successfully renewed. Thank you!`,
                    actionType: "PAYMENT_SUCCESS",
                    referenceId: subscription.id,
                });

                this.logger.log(`✅ Successfully renewed subscription ${subscription.id}`);
            } catch (error: any) {
                this.logger.error(`❌ Failed to process recurring billing for subscription ${subscription.id}: ${error.message}`);

                // If charge fails, mark subscription as PAST_DUE
                await this.prisma.subscription.update({
                    where: { id: subscription.id },
                    data: { status: "PAST_DUE" },
                });

                // Notify User about failure
                await this.notificationService.send({
                    userId: subscription.userId,
                    title: "Subscription Renewal Failed",
                    message: `We couldn't process your payment for ${subscription.category.name}. Please update your payment method to keep your subscription active.`,
                    actionType: "PAYMENT_FAILED",
                    referenceId: subscription.id,
                });
            }
        }

        this.logger.log("🏁 Completed daily recurring subscription billing process.");
    }
}
