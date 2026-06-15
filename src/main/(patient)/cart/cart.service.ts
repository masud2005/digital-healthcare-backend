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

        let stockAvailable = product.stockQuantity ?? 0;
        if (dto.size && product.variants && product.variants.length > 0) {
            const variant = product.variants.find(
                (v) => v.size.toLowerCase() === dto.size?.toLowerCase(),
            );
            if (!variant) {
                throw new NotFoundException(`Product size variant "${dto.size}" not found`);
            }
            stockAvailable = variant.stockQuantity;
        }

        if (stockAvailable < dto.quantity) {
            throw new BadRequestException(
                `Insufficient stock. Available: ${stockAvailable}`,
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

        const targetQuantity = dto.quantity !== undefined ? dto.quantity : item.quantity;
        const targetSize = dto.size !== undefined ? dto.size : item.size;

        const product = await this.cartRepository.findProduct(item.productId);
        if (!product) {
            throw new NotFoundException("Product not found");
        }

        let stockAvailable = product.stockQuantity ?? 0;
        if (targetSize && product.variants && product.variants.length > 0) {
            const variant = product.variants.find(
                (v) => v.size.toLowerCase() === targetSize.toLowerCase(),
            );
            if (!variant) {
                throw new NotFoundException(`Product size variant "${targetSize}" not found`);
            }
            stockAvailable = variant.stockQuantity;
        }

        if (stockAvailable < targetQuantity) {
            throw new BadRequestException(
                `Insufficient stock. Available: ${stockAvailable}`,
            );
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

                let productPrice = item.product.price ? Number(item.product.price) : 0;
                let stockQuantity = item.product.stockQuantity ?? 0;

                if (item.size && item.product.variants && item.product.variants.length > 0) {
                    const variant = item.product.variants.find(
                        (v) => v.size.toLowerCase() === item.size?.toLowerCase(),
                    );
                    if (variant) {
                        productPrice = Number(variant.price);
                        stockQuantity = variant.stockQuantity;
                    }
                }

                const itemTotal = productPrice * item.quantity;
                totalPrice += itemTotal;

                return {
                    id: item.id,
                    quantity: item.quantity,
                    size: item.size,
                    itemTotal: itemTotal.toFixed(2),
                    product: {
                        id: item.product.id,
                        name: item.product.name,
                        price: String(productPrice),
                        stockQuantity,
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
