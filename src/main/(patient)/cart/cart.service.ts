import { StorageService } from "@global/storage/storage.service";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
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

        // Product has variants — size must be chosen via update
        // Default add: use base stockQuantity if no variants, else check at least one variant has stock
        const hasVariants = product.variants.length > 0;

        if (hasVariants) {
            const anyStock = product.variants.some((v) => v.stockQuantity > 0);
            if (!anyStock) {
                throw new BadRequestException("Product is out of stock");
            }
        } else {
            if ((product.stockQuantity ?? 0) < 1) {
                throw new BadRequestException("Product is out of stock");
            }
        }

        const cart = await this.cartRepository.upsertCartAndAddItem(userId, dto.productId);
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
        if (dto.quantity === undefined && dto.size === undefined) {
            throw new BadRequestException("Provide quantity or size to update");
        }

        const cart = await this.getCartOrThrow(userId);
        const item = await this.cartRepository.findCartItemById(cartItemId, cart.id);

        if (!item) {
            throw new NotFoundException("Cart item not found");
        }

        const product = await this.cartRepository.findProduct(item.productId);

        if (!product) {
            throw new NotFoundException("Product not found");
        }

        const hasVariants = product.variants.length > 0;
        const targetSize = dto.size !== undefined ? dto.size : (item.size ?? undefined);
        const targetQty = dto.quantity ?? 1;

        if (hasVariants) {
            if (!targetSize) {
                const availableSizes = product.variants.map((v) => v.size).join(", ");
                throw new BadRequestException(
                    `Size is required for this product. Available sizes: ${availableSizes}`,
                );
            }

            const variant = product.variants.find((v) => v.size === targetSize);

            if (!variant) {
                const availableSizes = product.variants.map((v) => v.size).join(", ");
                throw new BadRequestException(
                    `Invalid size "${targetSize}". Available sizes: ${availableSizes}`,
                );
            }

            if (variant.stockQuantity < targetQty) {
                throw new BadRequestException(
                    `Insufficient stock for size "${targetSize}". Available: ${variant.stockQuantity}`,
                );
            }
        } else {
            if (dto.size !== undefined) {
                throw new BadRequestException("This product does not have size variants");
            }

            if ((product.stockQuantity ?? 0) < targetQty) {
                throw new BadRequestException(
                    `Insufficient stock. Available: ${product.stockQuantity ?? 0}`,
                );
            }
        }

        await this.cartRepository.updateCartItem(cartItemId, {
            ...(dto.quantity !== undefined ? { quantity: dto.quantity } : {}),
            ...(dto.size !== undefined ? { size: dto.size } : {}),
        });

        const updatedCart = await this.cartRepository.findCartByUserId(userId);
        return this.mapCart(updatedCart!);
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

                // Use variant price if size is set and variant exists, otherwise base price
                const activeVariant = item.size
                    ? item.product.variants.find((v) => v.size === item.size)
                    : null;

                const unitPrice = activeVariant
                    ? Number(activeVariant.price)
                    : Number(item.product.price ?? 0);

                const itemTotal = unitPrice * item.quantity;
                totalPrice += itemTotal;

                return {
                    id: item.id,
                    quantity: item.quantity,
                    size: item.size,
                    unitPrice: unitPrice.toFixed(2),
                    itemTotal: itemTotal.toFixed(2),
                    product: {
                        id: item.product.id,
                        name: item.product.name,
                        basePrice: item.product.price,
                        stockQuantity: item.product.stockQuantity,
                        variants: item.product.variants,
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
