import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

const cartInclude = {
    items: {
        orderBy: { createdAt: "asc" as const },
        include: {
            product: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    price: true,
                    stockQuantity: true,
                    categoryId: true,
                    images: {
                        select: {
                            id: true,
                            fileUrl: true,
                            fileName: true,
                            fileType: true,
                            fileSize: true,
                        },
                    },
                    variants: {
                        select: {
                            id: true,
                            size: true,
                            price: true,
                            stockQuantity: true,
                        },
                    },
                    category: {
                        select: {
                            paymentPlan: {
                                select: { id: true, price: true, billingCycle: true },
                            },
                        },
                    },
                },
            },
        },
    },
} satisfies Prisma.CartInclude;

export type CartRecord = Prisma.CartGetPayload<{ include: typeof cartInclude }>;

@Injectable()
export class CartRepository {
    constructor(private readonly prisma: PrismaService) {}

    findCartByUserId(userId: string): Promise<CartRecord | null> {
        return this.prisma.cart.findUnique({
            where: { userId },
            include: cartInclude,
        });
    }

    findCartItemById(id: string, cartId: string) {
        return this.prisma.cartItem.findFirst({
            where: { id, cartId },
        });
    }

    findProduct(productId: string) {
        return this.prisma.product.findUnique({
            where: { id: productId },
            select: {
                id: true,
                stockQuantity: true,
                variants: {
                    select: { size: true, stockQuantity: true, price: true },
                },
            },
        });
    }

    async upsertCartAndAddItem(
        userId: string,
        productId: string,
        defaultSize: string | null,
    ): Promise<CartRecord> {
        const cart = await this.prisma.cart.upsert({
            where: { userId },
            create: { userId },
            update: {},
            select: { id: true },
        });

        const existing = await this.prisma.cartItem.findFirst({
            where: { cartId: cart.id, productId, size: defaultSize },
        });

        if (existing) {
            await this.prisma.cartItem.update({
                where: { id: existing.id },
                data: { quantity: { increment: 1 } },
            });
        } else {
            await this.prisma.cartItem.create({
                data: { cartId: cart.id, productId, quantity: 1, size: defaultSize },
            });
        }

        return this.prisma.cart.findUnique({
            where: { userId },
            include: cartInclude,
        }) as Promise<CartRecord>;
    }

    removeCartItem(id: string) {
        return this.prisma.cartItem.delete({ where: { id } });
    }

    updateCartItem(id: string, data: { quantity?: number; size?: string | null }) {
        return this.prisma.cartItem.update({ where: { id }, data });
    }

    findUserWithCategory(userId: string) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                categoryId: true,
                category: {
                    select: {
                        paymentPlan: {
                            select: { id: true, price: true, billingCycle: true },
                        },
                    },
                },
            },
        });
    }

    findActiveDiscount(code: string) {
        return this.prisma.discount.findFirst({
            where: {
                code: { equals: code, mode: "insensitive" },
                isActive: true,
                OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
            },
            select: { id: true, type: true, value: true },
        });
    }
}
