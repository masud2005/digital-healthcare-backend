import { PrismaService } from "@global/prisma/prisma.service";
import { StorageService } from "@global/storage/storage.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { OrderStatus } from "@prisma/client";
import { DateRangeFilter, MyOrderRepository } from "./my-order.repository";

@Injectable()
export class MyOrderService {
    constructor(
        private readonly myOrderRepository: MyOrderRepository,
        private readonly storageService: StorageService,
        private readonly prisma: PrismaService,
    ) {}

    private async resolveReviewer(reviewedBy: string | null | undefined) {
        if (!reviewedBy) return null;
        const doc = await this.prisma.doctorProfile.findUnique({
            where: { userId: reviewedBy },
            select: { userId: true, name: true },
        });
        return doc ? { id: doc.userId, name: doc.name } : null;
    }

    async getMyOrders(userId: string, status?: OrderStatus, dateRange?: DateRangeFilter, page?: number, limit?: number) {
        const { orders, counts, total, page: currentPage, limit: currentLimit } = await this.myOrderRepository.findMyOrders(userId, status, dateRange, page, limit);

        const mappedOrders = await Promise.all(
            orders.map(async (order) => {
                const reviewer = await this.resolveReviewer(order.submission?.reviewedBy);
                return {
                    id: order.id,
                    orderNumber: order.orderNumber,
                    status: order.status,
                    total: Number(order.total),
                    itemCount: order.items.length,
                    createdAt: order.createdAt,
                    transactionId: order.payments?.[0]?.transactionId ?? null,
                    reviewedBy: reviewer,
                    submission: order.submission
                        ? {
                              id: order.submission.id,
                              assessmentTitle: order.submission.assessment.title,
                          }
                        : null,
                };
            }),
        );

        return { 
            orders: mappedOrders, 
            counts,
            meta: {
                page: currentPage,
                limit: currentLimit,
                total,
                totalPages: Math.ceil(total / currentLimit),
            },
        };
    }

    async getMyOrderById(orderId: string, userId: string) {
        const order = await this.myOrderRepository.findMyOrderById(orderId, userId);

        if (!order) {
            throw new NotFoundException("Order not found");
        }

        const payment = order.payments?.[0] ?? null;

        const items = await Promise.all(
            order.items.map(async (item) => ({
                name: item.productNameSnapshot,
                size: item.variantSizeSnapshot ?? null,
                image: item.productImageSnapshot
                    ? await this.storageService.resolveKey(item.productImageSnapshot)
                    : null,
                quantity: item.quantity,
                unitPrice: Number(item.unitPrice),
                totalPrice: Number(item.totalPrice),
            })),
        );

        const reviewer = await this.resolveReviewer(order.submission?.reviewedBy);

        return {
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            // Full status timeline
            timeline: {
                submittedAt: order.createdAt,
                confirmedAt: order.confirmedAt ?? null,
                processingAt: order.processingAt ?? null,
                shippedAt: order.shippedAt ?? null,
                deliveredAt: order.deliveredAt ?? null,
                cancelledAt: order.cancelledAt ?? null,
            },
            orderInfo: {
                orderId: order.id,
                orderNumber: order.orderNumber,
                transactionId: payment?.transactionId ?? null,
                orderStatus: order.status,
                patientName: order.user?.name ?? null,
                approvedBy: reviewer,
            },
            items,
            subtotal: Number(order.subtotal),
            discountAmount: Number(order.discountAmount),
            shippingAmount: Number(order.shippingAmount),
            total: Number(order.total),
            shippingAddress: {
                name: order.shippingName ?? null,
                address: order.shippingAddress ?? null,
                city: order.shippingCity ?? null,
                state: order.shippingState ?? null,
                zip: order.shippingZip ?? null,
                country: order.shippingCountry ?? null,
            },
            paymentDetails: payment
                ? {
                      paymentDate: payment.paidAt ?? null,
                      transactionId: payment.transactionId,
                      cardBrand: payment.brand ?? null,
                      last4: payment.last4 ?? null,
                      totalAmount: Number(payment.amount),
                      paymentStatus: payment.status,
                  }
                : null,
            shippingInfo: {
                trackingCarrier: order.trackingCarrier ?? null,
                trackingNumber: order.trackingNumber ?? null,
            },
            submission: order.submission
                ? {
                      id: order.submission.id,
                      assessmentId: order.submission.assessment.id,
                      assessmentTitle: order.submission.assessment.title,
                  }
                : null,
        };
    }
}
