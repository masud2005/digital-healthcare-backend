import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { OrderQueryDto, UpdateOrderDto } from "./dto/order.dto";

function getDateRange(range: string): { gte?: Date; lte?: Date } | undefined {
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
export class AdminOrderRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(query: OrderQueryDto) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const skip = (page - 1) * limit;

        const where: Prisma.OrderWhereInput = {};

        if (query.status) {
            where.status = query.status;
        }

        if (query.search) {
            where.orderNumber = { contains: query.search, mode: "insensitive" };
        }

        if (query.dateRange) {
            const range = getDateRange(query.dateRange);
            if (range) {
                where.createdAt = range;
            }
        }

        if (query.doctorName) {
            const doctors = await this.prisma.doctorProfile.findMany({
                where: { name: { contains: query.doctorName, mode: "insensitive" } },
                select: { userId: true },
            });
            const doctorUserIds = doctors.map((d) => d.userId);
            where.submission = {
                reviewedBy: { in: doctorUserIds },
            };
        }

        const [orders, total] = await this.prisma.$transaction([
            this.prisma.order.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    orderNumber: true,
                    status: true,
                    total: true,
                    createdAt: true,
                    items: { select: { id: true } }, // just to get the count
                    user: {
                        select: {
                            name: true,
                            patientProfile: { select: { name: true } },
                        },
                    },
                    submission: {
                        select: {
                            reviewedBy: true,
                        },
                    },
                },
            }),
            this.prisma.order.count({ where }),
        ]);

        return { orders, total, page, limit };
    }

    async findDoctorByUserId(userId: string) {
        return this.prisma.doctorProfile.findUnique({
            where: { userId },
            select: { name: true },
        });
    }

    async findById(id: string) {
        return this.prisma.order.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        name: true,
                        phone: true,
                        patientProfile: {
                            select: { name: true },
                        },
                    },
                },
                items: true,
                submission: {
                    select: {
                        reviewedBy: true,
                    },
                },
                payments: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    select: {
                        method: true,
                        last4: true,
                        brand: true,
                        amount: true,
                        status: true,
                        transactionId: true,
                    },
                },
            },
        });
    }

    async update(id: string, data: UpdateOrderDto) {
        return this.prisma.order.update({
            where: { id },
            data,
        });
    }
}
