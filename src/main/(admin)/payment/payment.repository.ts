import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PaymentItemType, PaymentStatus } from "@prisma/client";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

@Injectable()
export class AdminPaymentRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(params: {
        page?: number;
        limit?: number;
        search?: string;
        paymentType?: PaymentItemType;
        status?: PaymentStatus;
    }) {
        const page = params.page ?? DEFAULT_PAGE;
        const limit = params.limit ?? DEFAULT_LIMIT;
        const skip = (page - 1) * limit;

        const where: Prisma.PaymentWhereInput = {};

        if (params.status) {
            where.status = params.status;
        }

        if (params.paymentType) {
            where.paymentType = { has: params.paymentType };
        }

        if (params.search) {
            where.user = {
                OR: [
                    { name: { contains: params.search, mode: "insensitive" } },
                    {
                        patientProfile: {
                            name: { contains: params.search, mode: "insensitive" },
                        },
                    },
                ],
            };
        }

        const [data, total] = await this.prisma.$transaction([
            this.prisma.payment.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    transactionId: true,
                    amount: true,
                    status: true,
                    last4: true,
                    brand: true,
                    paymentType: true,
                    paidAt: true,
                    createdAt: true,
                    user: {
                        select: {
                            name: true,
                            patientProfile: { select: { name: true } },
                        },
                    },
                },
            }),
            this.prisma.payment.count({ where }),
        ]);

        return { data, total, page, limit };
    }

    async findById(id: string) {
        return this.prisma.payment.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        patientProfile: { select: { name: true } },
                    },
                },
                order: {
                    select: {
                        id: true,
                        orderNumber: true,
                        status: true,
                    },
                },
                subscription: {
                    select: {
                        id: true,
                        status: true,
                    },
                },
            },
        });
    }
}
