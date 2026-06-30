import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { OrderStatus } from "@prisma/client";

export type DateRangeFilter = "TODAY" | "LAST_7_DAYS" | "LAST_MONTH" | "LAST_YEAR" | "ALL";

function getDateRange(range: DateRangeFilter): { gte?: Date; lte?: Date } | undefined {
    const now = new Date();
    if (range === "TODAY") {
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        const end = new Date(now);
        end.setHours(23, 59, 59, 999);
        return { gte: start, lte: end };
    }
    if (range === "LAST_7_DAYS") {
        const start = new Date(now);
        start.setDate(start.getDate() - 7);
        return { gte: start };
    }
    if (range === "LAST_MONTH") {
        const start = new Date(now);
        start.setMonth(start.getMonth() - 1);
        return { gte: start };
    }
    if (range === "LAST_YEAR") {
        const start = new Date(now);
        start.setFullYear(start.getFullYear() - 1);
        return { gte: start };
    }
    return undefined;
}

@Injectable()
export class MyOrderRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findMyOrders(
        userId: string,
        status?: OrderStatus,
        dateRange?: DateRangeFilter,
        page?: number,
        limit?: number,
    ) {
        const currentPage = page ?? 1;
        const currentLimit = limit ?? 10;
        const skip = (currentPage - 1) * currentLimit;

        const where: any = { userId };

        if (status) {
            where.status = status;
        }

        const range = dateRange ? getDateRange(dateRange) : undefined;
        if (range) {
            where.createdAt = range;
        }

        const [orders, total, statusCounts] = await Promise.all([
            this.prisma.order.findMany({
                where,
                skip,
                take: currentLimit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    orderNumber: true,
                    status: true,
                    total: true,
                    createdAt: true,
                    items: {
                        select: { 
                            id: true, 
                            productNameSnapshot: true,
                            product: {
                                select: {
                                    categoryId: true,
                                    category: { select: { name: true } }
                                }
                            }
                        },
                    },
                    payments: {
                        select: {
                            transactionId: true,
                        },
                    },
                    submission: {
                        select: {
                            id: true,
                            reviewedBy: true,
                            assessment: {
                                select: { 
                                    title: true,
                                    categoryId: true,
                                    category: { select: { name: true } },
                                },
                            },
                        },
                    },
                },
            }),
            this.prisma.order.count({ where }),
            this.prisma.order.groupBy({
                by: ["status"],
                where: { userId },
                _count: { status: true },
            }),
        ]);

        const counts = statusCounts.reduce(
            (acc, curr) => {
                acc[curr.status] = curr._count.status;
                return acc;
            },
            {} as Record<string, number>,
        );

        return { orders, counts, total, page: currentPage, limit: currentLimit };
    }

    findMyOrderById(id: string, userId: string) {
        return this.prisma.order.findFirst({
            where: { id, userId },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                categoryId: true,
                                category: { select: { name: true } },
                            },
                        },
                    },
                },
                payments: {
                    include: {
                        subscription: { include: { paymentPlan: true } },
                    },
                },
                submission: {
                    select: {
                        id: true,
                        reviewedBy: true,
                        doctorNotes: true,
                        assessment: {
                            select: {
                                id: true,
                                title: true,
                                categoryId: true,
                                category: { select: { name: true } },
                            },
                        },
                    },
                },
                user: {
                    select: { id: true, name: true },
                },
            },
        });
    }
}
