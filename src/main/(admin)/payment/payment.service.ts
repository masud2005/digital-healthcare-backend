import { Injectable, NotFoundException } from "@nestjs/common";
import { PaymentQueryDto } from "./dto/payment.dto";
import { AdminPaymentRepository } from "./payment.repository";

@Injectable()
export class AdminPaymentService {
    constructor(private readonly paymentRepository: AdminPaymentRepository) {}

    async findAll(query: PaymentQueryDto) {
        const { data, total, page, limit } = await this.paymentRepository.findAll(query);

        const payments = data.map((payment) => ({
            id: payment.id,
            patientName: payment.user.patientProfile?.name ?? payment.user.name ?? "Unknown",
            last4: payment.last4 ?? null,
            brand: payment.brand ?? null,
            transactionId: payment.transactionId,
            paymentType: payment.paymentType.join(", "),
            amount: Number(payment.amount),
            date: payment.paidAt ?? payment.createdAt,
            status: payment.status,
        }));

        return {
            payments,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }

    async findById(id: string) {
        const payment = await this.paymentRepository.findById(id);

        if (!payment) {
            throw new NotFoundException("Payment not found");
        }

        return {
            id: payment.id,
            transactionId: payment.transactionId,
            amount: Number(payment.amount),
            currency: payment.currency,
            status: payment.status,
            method: payment.method,
            last4: payment.last4 ?? null,
            brand: payment.brand ?? null,
            paymentType: payment.paymentType.join(", "),
            paidAt: payment.paidAt ?? null,
            failedAt: payment.failedAt ?? null,
            refundedAt: payment.refundedAt ?? null,
            createdAt: payment.createdAt,
            patient: payment.user
                ? {
                      id: payment.user.id,
                      name: payment.user.patientProfile?.name ?? payment.user.name ?? null,
                      email: payment.user.email,
                      phone: payment.user.phone ?? null,
                      address: payment.user.patientProfile?.address ?? null,
                      bio: payment.user.patientProfile?.bio ?? null,
                      city: payment.user.patientProfile?.city ?? null,
                      state: payment.user.patientProfile?.state ?? null,
                      zip: payment.user.patientProfile?.zipCode ?? null,
                  }
                : null,
            order: payment.order
                ? {
                      id: payment.order.id,
                      orderNumber: payment.order.orderNumber,
                      status: payment.order.status,
                      subtotal: Number(payment.order.subtotal),
                      discountAmount: Number(payment.order.discountAmount),
                      shippingAmount: Number(payment.order.shippingAmount),
                      total: Number(payment.order.total),
                      items: payment.order.items.map((item) => ({
                          id: item.id,
                          quantity: item.quantity,
                          unitPrice: Number(item.unitPrice),
                          totalPrice: Number(item.totalPrice),
                          productName: item.productNameSnapshot,
                          variantSize: item.variantSizeSnapshot ?? null,
                      })),
                  }
                : null,
            subscription: payment.subscription
                ? {
                      id: payment.subscription.id,
                      status: payment.subscription.status,
                      startDate: payment.subscription.startDate,
                      endDate: payment.subscription.endDate ?? null,
                      nextBillingDate: payment.subscription.nextBillingDate ?? null,
                      categoryName: payment.subscription.category.name,
                      paymentPlanName: payment.subscription.paymentPlan.billingCycle,
                  }
                : null,
        };
    }
}
