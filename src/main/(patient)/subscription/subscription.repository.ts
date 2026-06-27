import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class SubscriptionRepository {
    constructor(private readonly prisma: PrismaService) {}

    findAllByUser(userId: string) {
        return this.prisma.subscription.findMany({
            where: { userId },
            select: {
                id: true,
                status: true,
                isRecurring: true,
                startDate: true,
                nextBillingDate: true,
                currentPeriodStart: true,
                currentPeriodEnd: true,
                cancelledAt: true,
                cancelReason: true,
                createdAt: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                        icon: true,
                    },
                },
                paymentPlan: {
                    select: {
                        id: true,
                        price: true,
                        billingCycle: true,
                    },
                },
                payments: {
                    select: {
                        id: true,
                        transactionId: true,
                        amount: true,
                        status: true,
                        paidAt: true,
                        last4: true,
                        brand: true,
                    },
                    orderBy: { createdAt: "desc" },
                    take: 5,
                },
            },
            orderBy: { createdAt: "desc" },
        });
    }

    findOneByUser(subscriptionId: string, userId: string) {
        return this.prisma.subscription.findFirst({
            where: { id: subscriptionId, userId },
            select: {
                id: true,
                status: true,
                isRecurring: true,
                startDate: true,
                nextBillingDate: true,
                currentPeriodStart: true,
                currentPeriodEnd: true,
                cancelledAt: true,
                cancelReason: true,
                createdAt: true,
                category: {
                    select: { id: true, name: true },
                },
                paymentPlan: {
                    select: { id: true, price: true, billingCycle: true },
                },
            },
        });
    }

    findOneWithTokenByUser(subscriptionId: string, userId: string) {
        return this.prisma.subscription.findFirst({
            where: { id: subscriptionId, userId },
            select: {
                id: true,
                status: true,
                isRecurring: true,
                cloverCardToken: true,
                paymentPlan: {
                    select: { price: true, billingCycle: true },
                },
            },
        });
    }

    updateIsRecurring(subscriptionId: string, userId: string, isRecurring: boolean) {
        return this.prisma.subscription.update({
            where: { id: subscriptionId, userId },
            data: { isRecurring },
            select: {
                id: true,
                isRecurring: true,
                status: true,
                nextBillingDate: true,
            },
        });
    }
}
