import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

@Injectable()
export class PaymentRepository {
    constructor(private readonly prisma: PrismaService) {}

    findSubmissionById(submissionId: string, userId: string) {
        return this.prisma.assessmentSubmission.findFirst({
            where: { id: submissionId, userId, status: "DRAFT" },
        });
    }

    async executeCheckoutTransaction(
        userId: string,
        submissionId: string,
        cart: any,
        checkoutData: {
            subtotal: number;
            discountAmount: number;
            shippingCharge: number;
            total: number;
            shippingInfo: any;
            complianceConfirmation: any;
            discountId?: string;
            isRecurring: boolean;
            paymentPlan: any;
            categoryId: string;
        },
    ) {
        const {
            subtotal,
            discountAmount,
            shippingCharge,
            total,
            shippingInfo,
            complianceConfirmation,
            discountId,
            isRecurring,
            paymentPlan,
            categoryId,
        } = checkoutData;

        return this.prisma.$transaction(async (tx) => {
            // 1. Update Assessment Submission status
            await tx.assessmentSubmission.update({
                where: { id: submissionId },
                data: { status: "PENDING" },
            });

            // 2. Create Compliance Confirmation
            await tx.complianceConfirmation.create({
                data: {
                    agreedToTermsAndPrivacy: complianceConfirmation.agreedToTermsAndPrivacy,
                    certifiedInfoAccurate: complianceConfirmation.certifiedInfoAccurate,
                    understoodFalseInfoConsequences: complianceConfirmation.understoodFalseInfoConsequences,
                    understoodRecommendationsBasis: complianceConfirmation.understoodRecommendationsBasis,
                    understoodAdditionalInfoMayBeRequested: complianceConfirmation.understoodAdditionalInfoMayBeRequested,
                    userId,
                    submissionId,
                },
            });

            // 3. Create Order
            const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
            const order = await tx.order.create({
                data: {
                    orderNumber,
                    status: "PENDING",
                    subtotal,
                    discountAmount,
                    shippingAmount: shippingCharge,
                    total,
                    shippingName: shippingInfo.fullName,
                    shippingAddress: shippingInfo.address,
                    shippingCity: shippingInfo.city,
                    shippingState: shippingInfo.state,
                    shippingZip: shippingInfo.zip,
                    userId,
                    discountId,
                },
            });

            // 4. Create Order Items
            for (const item of cart.items) {
                const activeVariant = item.size
                    ? item.product.variants.find((v: any) => v.size === item.size)
                    : null;
                const unitPrice = activeVariant ? Number(activeVariant.price) : Number(item.product.price);
                const itemTotal = unitPrice * item.quantity;

                await tx.orderItem.create({
                    data: {
                        quantity: item.quantity,
                        unitPrice,
                        totalPrice: itemTotal,
                        productNameSnapshot: item.product.name,
                        variantSizeSnapshot: item.size,
                        productImageSnapshot: item.product.images?.[0]?.fileUrl ?? null,
                        orderId: order.id,
                        productId: item.productId,
                        variantId: activeVariant?.id,
                    },
                });
            }

            // 5. Handle Subscription if applicable
            let subscriptionId: string | null = null;
            if (isRecurring && paymentPlan && categoryId) {
                // Calculate next billing date based on billing cycle
                const startDate = new Date();
                let nextBillingDate = new Date(startDate);
                if (paymentPlan.billingCycle === "MONTHLY") {
                    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
                } else if (paymentPlan.billingCycle === "YEARLY") {
                    nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
                } else if (paymentPlan.billingCycle === "QUARTERLY") {
                    nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
                }

                const subscription = await tx.subscription.create({
                    data: {
                        status: "ACTIVE",
                        startDate,
                        nextBillingDate,
                        currentPeriodStart: startDate,
                        currentPeriodEnd: nextBillingDate,
                        isRecurring: true,
                        userId,
                        categoryId,
                        paymentPlanId: paymentPlan.id,
                        discountId,
                    },
                });
                subscriptionId = subscription.id;
            }

            // 6. Create Payment Record (Mocking Clover success)
            const transactionId = `TXN-CLVR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            await tx.payment.create({
                data: {
                    transactionId,
                    amount: total,
                    currency: "USD",
                    status: "COMPLETED",
                    method: "CLOVER",
                    paidAt: new Date(),
                    userId,
                    orderId: order.id,
                    subscriptionId,
                    discountId,
                },
            });

            // 7. Clear the User's Cart
            await tx.cartItem.deleteMany({
                where: { cartId: cart.id },
            });

            return {
                orderNumber: order.orderNumber,
                transactionId,
                status: "success",
            };
        });
    }
}
