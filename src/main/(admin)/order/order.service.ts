import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { OrderQueryDto, UpdateOrderDto } from "./dto/order.dto";
import { AdminOrderRepository } from "./order.repository";
import { NotificationService } from "../../notification/notification.service";

@Injectable()
export class AdminOrderService {
    constructor(
        private readonly orderRepository: AdminOrderRepository,
        private readonly notificationService: NotificationService,
    ) {}

    async findAll(query: OrderQueryDto) {
        const { orders, total, page, limit } = await this.orderRepository.findAll(query);

        const mappedOrders = await Promise.all(
            orders.map(async (order) => {
                let doctorName = "N/A";
                if (order.submission?.reviewedBy) {
                    const doc = await this.orderRepository.findDoctorByUserId(order.submission.reviewedBy);
                    if (doc) doctorName = doc.name;
                }

                return {
                    id: order.id,
                    orderNumber: order.orderNumber,
                    itemCount: order.items.length,
                    total: Number(order.total),
                    patientName: order.user.patientProfile?.name ?? order.user.name ?? "Unknown",
                    doctorName,
                    date: order.createdAt,
                    status: order.status,
                };
            }),
        );

        return {
            orders: mappedOrders,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findById(id: string) {
        const order = await this.orderRepository.findById(id);

        if (!order) {
            throw new NotFoundException("Order not found");
        }

        let doctorName = "N/A";
        if (order.submission?.reviewedBy) {
            const doc = await this.orderRepository.findDoctorByUserId(order.submission.reviewedBy);
            if (doc) doctorName = doc.name;
        }

        const payment = order.payments?.[0]; // Get latest payment if exists

        return {
            id: order.id,
            orderNumber: order.orderNumber,
            orderDate: order.createdAt,
            patientName: order.user.patientProfile?.name ?? order.user.name ?? "Unknown",
            doctorName,
            status: order.status,
            items: order.items.map((item) => ({
                id: item.id,
                productName: item.productNameSnapshot,
                variantSize: item.variantSizeSnapshot ?? null,
                unitPrice: Number(item.unitPrice),
                quantity: item.quantity,
                totalPrice: Number(item.totalPrice),
                productImage: item.productImageSnapshot ?? null,
            })),
            subtotal: Number(order.subtotal),
            discountAmount: Number(order.discountAmount),
            shippingAmount: Number(order.shippingAmount),
            totalAmount: Number(order.total),
            shippingAddress: {
                name: order.shippingName ?? null,
                phone: order.user.phone ?? null,
                address: order.shippingAddress ?? null,
                city: order.shippingCity ?? null,
                state: order.shippingState ?? null,
                zip: order.shippingZip ?? null,
                country: order.shippingCountry ?? null,
            },
            paymentDetails: payment
                ? {
                      method: payment.method,
                      last4: payment.last4 ?? null,
                      brand: payment.brand ?? null,
                      totalAmount: Number(payment.amount),
                      status: payment.status,
                      transactionId: payment.transactionId,
                  }
                : null,
            shippingInfo: {
                carrierName: order.trackingCarrier ?? null,
                trackingNumber: order.trackingNumber ?? null,
            },
        };
    }

    async update(id: string, dto: UpdateOrderDto) {
        const order = await this.orderRepository.findById(id);
        if (!order) {
            throw new NotFoundException("Order not found");
        }

        if (order.status === "CANCELLED" || order.status === "REFUNDED") {
            throw new BadRequestException("Cannot update an order that has been cancelled or refunded");
        }

        await this.orderRepository.update(id, dto);

        if (dto.status) {
            // Notify Patient
            await this.notificationService.send({
                userId: order.userId,
                title: "Order Status Updated",
                message: `Your order #${order.orderNumber} status has been updated to ${dto.status}.`,
                actionType: "ORDER_STATUS_UPDATED",
                referenceId: order.id,
            });
        }

        return { message: "Order updated successfully" };
    }
}
