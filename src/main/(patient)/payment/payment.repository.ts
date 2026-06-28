import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PaymentRepository {
    constructor(private readonly prisma: PrismaService) {}

    findSubmissionById(submissionId: string, userId: string) {
        return this.prisma.assessmentSubmission.findFirst({
            where: { id: submissionId, userId, status: "DRAFT" },
            include: {
                assessment: {
                    select: {
                        category: {
                            select: { id: true, paymentPlan: true },
                        },
                    },
                },
            },
        });
    }

    // Finds submission regardless of status — used for pre-checkout status validation
    findSubmissionByIdAny(submissionId: string, userId: string) {
        return this.prisma.assessmentSubmission.findFirst({
            where: { id: submissionId, userId },
            include: {
                complianceConfirmation: { select: { id: true } },
                assessment: {
                    select: {
                        category: {
                            select: { id: true, paymentPlan: true },
                        },
                    },
                },
            },
        });
    }

    findActiveSubscription(userId: string, categoryId: string) {
        return this.prisma.subscription.findFirst({
            where: { userId, categoryId, status: "ACTIVE" },
            select: { id: true },
        });
    }

    async executeCheckoutTransaction(
        userId: string,
        submissionId: string | undefined,
        cart: any,
        checkoutData: {
            subtotal: number;
            discountAmount: number;
            shippingCharge: number;
            total: number;
            shippingInfo: any;
            complianceConfirmation?: any;
            discountId?: string;
            isRecurring: boolean;
            billingCycle?: any;
            paymentPlan: any;
            categoryId: string;
            paymentType: ("FEES" | "PRODUCT")[];
            last4: string;
            brand: string;
            cloverChargeId: string;
            cloverCardToken: string;
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
            paymentType,
            last4,
            brand,
            cloverChargeId,
            cloverCardToken,
        } = checkoutData;

        return this.prisma.$transaction(async (tx) => {
            // 1. Update Assessment Submission status (only if submissionId provided)
            if (submissionId) {
                await tx.assessmentSubmission.update({
                    where: { id: submissionId },
                    data: { status: "PENDING" },
                });

                // 2. Create Compliance Confirmation (only if data provided)
                if (complianceConfirmation) {
                    await tx.complianceConfirmation.create({
                        data: {
                            agreedToTermsAndPrivacy: complianceConfirmation.agreedToTermsAndPrivacy,
                            certifiedInfoAccurate: complianceConfirmation.certifiedInfoAccurate,
                            understoodFalseInfoConsequences:
                                complianceConfirmation.understoodFalseInfoConsequences,
                            understoodRecommendationsBasis:
                                complianceConfirmation.understoodRecommendationsBasis,
                            understoodAdditionalInfoMayBeRequested:
                                complianceConfirmation.understoodAdditionalInfoMayBeRequested,
                            userId,
                            submissionId,
                        },
                    });
                }
            }

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
                    submissionId: submissionId ?? null,
                },
            });

            // 4. Create Order Items (only if cart has items)
            if (cart?.items?.length > 0) {
                for (const item of cart.items) {
                    const activeVariant = item.size
                        ? item.product.variants.find((v: any) => v.size === item.size)
                        : null;
                    const unitPrice = activeVariant
                        ? Number(activeVariant.price)
                        : Number(item.product.price);
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
            }

            // 5. Handle Subscription if isRecurring and paymentPlan and categoryId exist
            let subscriptionId: string | null = null;
            if (isRecurring && paymentPlan && categoryId) {
                const cycle = checkoutData.billingCycle || paymentPlan.billingCycle;
                const startDate = new Date();
                const nextBillingDate = new Date(startDate);

                if (cycle === "MONTHLY") {
                    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
                } else if (cycle === "YEARLY") {
                    nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
                } else if (cycle === "QUARTERLY") {
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
                        cloverCardToken,
                        userId,
                        categoryId,
                        paymentPlanId: paymentPlan.id,
                        discountId,
                    },
                });
                subscriptionId = subscription.id;
            }

            // 6. Create Payment Record (Clover charge confirmed)
            const transactionId = cloverChargeId;
            await tx.payment.create({
                data: {
                    transactionId,
                    amount: total,
                    currency: "USD",
                    status: "COMPLETED",
                    method: "CLOVER",
                    last4,
                    brand,
                    paymentType,
                    paidAt: new Date(),
                    userId,
                    orderId: order.id,
                    subscriptionId,
                    discountId,
                },
            });

            // 7. Clear the User's Cart
            if (cart?.id) {
                await tx.cartItem.deleteMany({
                    where: { cartId: cart.id },
                });
            }

            return {
                orderNumber: order.orderNumber,
                transactionId,
                paymentType,
                status: "success",
            };
        });
    }
}
