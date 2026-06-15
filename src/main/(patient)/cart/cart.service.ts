import { StorageService } from "@global/storage/storage.service";
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import type { CartRecord } from "./cart.repository";
import { CartRepository } from "./cart.repository";
import type { AddToCartDto, UpdateCartItemDto } from "./dto/cart.dto";

@Injectable()
export class CartService {
    constructor(
        private readonly cartRepository: CartRepository,
        private readonly storageService: StorageService,
    ) {}

    async addToCart(userId: string, dto: AddToCartDto) {
        const product = await this.cartRepository.findProduct(dto.productId);

        if (!product) {
            throw new NotFoundException("Product not found");
        }

        if (product.stockQuantity < dto.quantity) {
            throw new BadRequestException(
                `Insufficient stock. Available: ${product.stockQuantity}`,
            );
        }

        const cart = await this.cartRepository.upsertCartAndAddItem(
            userId,
            dto.productId,
            dto.quantity,
            dto.size,
        );

        return this.mapCart(cart);
    }

    async removeFromCart(userId: string, cartItemId: string) {
        const cart = await this.getCartOrThrow(userId);
        const item = await this.cartRepository.findCartItemById(cartItemId, cart.id);

        if (!item) {
            throw new NotFoundException("Cart item not found");
        }

        await this.cartRepository.removeCartItem(cartItemId);

        return { message: "Item removed from cart" };
    }

    async updateCartItem(userId: string, cartItemId: string, dto: UpdateCartItemDto) {
        if (!dto.quantity && !dto.size) {
            throw new BadRequestException("Provide quantity or size to update");
        }

        const cart = await this.getCartOrThrow(userId);
        const item = await this.cartRepository.findCartItemById(cartItemId, cart.id);

        if (!item) {
            throw new NotFoundException("Cart item not found");
        }

        if (dto.quantity !== undefined) {
            const product = await this.cartRepository.findProduct(item.productId);

            if (!product || product.stockQuantity < dto.quantity) {
                throw new BadRequestException(
                    `Insufficient stock. Available: ${product?.stockQuantity ?? 0}`,
                );
            }
        }

        const updated = await this.cartRepository.updateCartItem(cartItemId, {
            ...(dto.quantity !== undefined ? { quantity: dto.quantity } : {}),
            ...(dto.size !== undefined ? { size: dto.size } : {}),
        });

        return updated;
    }

    async getMyCarts(userId: string) {
        const cart = await this.cartRepository.findCartByUserId(userId);

        if (!cart) {
            return { id: null, items: [], totalPrice: "0.00" };
        }

        return this.mapCart(cart);
    }

    private async getCartOrThrow(userId: string) {
        const cart = await this.cartRepository.findCartByUserId(userId);

        if (!cart) {
            throw new NotFoundException("Cart not found");
        }

        return cart;
    }

    private async mapCart(cart: CartRecord) {
        let totalPrice = 0;

        const items = await Promise.all(
            cart.items.map(async (item) => {
                const resolvedImages = await Promise.all(
                    item.product.images.map(async (img) => ({
                        ...img,
                        fileUrl: await this.storageService.resolveKey(img.fileUrl),
                    })),
                );

                const itemTotal = Number(item.product.price) * item.quantity;
                totalPrice += itemTotal;

                return {
                    id: item.id,
                    quantity: item.quantity,
                    size: item.size,
                    itemTotal: itemTotal.toFixed(2),
                    product: {
                        id: item.product.id,
                        name: item.product.name,
                        price: item.product.price,
                        stockQuantity: item.product.stockQuantity,
                        images: resolvedImages,
                    },
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                };
            }),
        );

        return {
            id: cart.id,
            items,
            totalPrice: totalPrice.toFixed(2),
            createdAt: cart.createdAt,
            updatedAt: cart.updatedAt,
        };
    }
}
