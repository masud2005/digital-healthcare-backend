import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

const cartInclude = {
    items: {
        orderBy: { createdAt: "asc" },
        include: {
            product: {
                select: {
                    id: true,
                    name: true,
                    price: true,
                    stockQuantity: true,
                    images: {
                        select: {
                            id: true,
                            fileUrl: true,
                            fileName: true,
                            fileType: true,
                            fileSize: true,
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
            select: { id: true, stockQuantity: true },
        });
    }

    findExistingCartItem(cartId: string, productId: string, size?: string) {
        return this.prisma.cartItem.findUnique({
            where: {
                cartId_productId_size: {
                    cartId,
                    productId,
                    size: size ?? "",
                },
            },
        });
    }

    async upsertCartAndAddItem(
        userId: string,
        productId: string,
        quantity: number,
        size?: string,
    ): Promise<CartRecord> {
        const cart = await this.prisma.cart.upsert({
            where: { userId },
            create: { userId },
            update: {},
            select: { id: true },
        });

        await this.prisma.cartItem.upsert({
            where: {
                cartId_productId_size: {
                    cartId: cart.id,
                    productId,
                    size: size ?? "",
                },
            },
            create: { cartId: cart.id, productId, quantity, size: size ?? null },
            update: { quantity: { increment: quantity } },
        });

        return this.prisma.cart.findUnique({
            where: { userId },
            include: cartInclude,
        }) as Promise<CartRecord>;
    }

    removeCartItem(id: string) {
        return this.prisma.cartItem.delete({ where: { id } });
    }

    updateCartItem(id: string, data: { quantity?: number; size?: string }) {
        return this.prisma.cartItem.update({ where: { id }, data });
    }
}
