import { StorageService } from "@global/storage/storage.service";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { CartRecord } from "./cart.repository";
import { CartRepository } from "./cart.repository";
import type { AddToCartDto, UpdateCartItemDto } from "./dto/cart.dto";

const SHIPPING_CHARGE = 20;

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

        const hasVariants = product.variants.length > 0;

        if (hasVariants) {
            const firstAvailableVariant = product.variants.find((v) => v.stockQuantity > 0);

            if (!firstAvailableVariant) {
                throw new BadRequestException("Product is out of stock");
            }

            const cart = await this.cartRepository.upsertCartAndAddItem(
                userId,
                dto.productId,
                firstAvailableVariant.size,
            );
            return this.mapCart(cart, "Product added to cart");
        } else {
            if ((product.stockQuantity ?? 0) < 1) {
                throw new BadRequestException("Product is out of stock");
            }

            const cart = await this.cartRepository.upsertCartAndAddItem(
                userId,
                dto.productId,
                null,
            );
            return this.mapCart(cart, "Product added to cart");
        }
    }

    async removeFromCart(userId: string, cartItemId: string) {
        const cart = await this.getCartOrThrow(userId);
        const item = await this.cartRepository.findCartItemById(cartItemId, cart.id);

        if (!item) {
            throw new NotFoundException("Cart item not found");
        }

        await this.cartRepository.removeCartItem(cartItemId);
        return {
            success: true,
            statusCode: 200,
            message: "Item removed from cart",
            data: null,
        };
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
        return this.mapCart(updatedCart!, "Cart item updated");
    }

    async getMyCarts(userId: string) {
        const cart = await this.cartRepository.findCartByUserId(userId);

        if (!cart) {
            return {
                success: true,
                statusCode: 200,
                message: "Cart fetched successfully",
                data: { id: null, totalItem: 0, items: [], totalPrice: "0.00" },
            };
        }

        return this.mapCart(cart, "Cart fetched successfully");
    }

    private async getCartOrThrow(userId: string) {
        const cart = await this.cartRepository.findCartByUserId(userId);

        if (!cart) {
            throw new NotFoundException("Cart not found");
        }

        return cart;
    }

    async getCartSummary(userId: string, discountCode?: string, submissionId?: string) {
        const cart = await this.cartRepository.findCartByUserId(userId);
        
        let paymentPlan: any = null;

        if (submissionId) {
            const submission = await this.cartRepository.findSubmission(submissionId, userId);
            if (!submission) {
                throw new BadRequestException("Invalid submissionId");
            }
            paymentPlan = submission.assessment?.category?.paymentPlan ?? null;
        }

        let subtotal = 0;
        if (cart) {
            for (const item of cart.items) {
                const activeVariant = item.size
                    ? item.product.variants.find((v) => v.size === item.size)
                    : null;
                const unitPrice = activeVariant
                    ? Number(activeVariant.price)
                    : Number(item.product.price ?? 0);
                subtotal += unitPrice * item.quantity;
            }
        }

        const serviceFees = paymentPlan ? Number(paymentPlan.price) : 0;
        const serviceDuration = paymentPlan?.billingCycle ?? null;
        const shippingCharge = (cart?.items?.length ?? 0) > 0 ? SHIPPING_CHARGE : 0;

        let discount = 0;
        let discountMeta: { code: string; type: string; value: number } | null = null;

        if (discountCode) {
            const found = await this.cartRepository.findActiveDiscount(discountCode);

            if (!found) {
                throw new BadRequestException("Invalid or expired discount code");
            }

            const baseForDiscount = subtotal + serviceFees + shippingCharge;

            discount =
                found.type === "PERCENTAGE"
                    ? parseFloat(((baseForDiscount * found.value) / 100).toFixed(2))
                    : parseFloat(Math.min(found.value, baseForDiscount).toFixed(2));

            discountMeta = {
                code: discountCode.toUpperCase(),
                type: found.type,
                value: found.value,
            };
        }

        const total = parseFloat((subtotal + serviceFees + shippingCharge - discount).toFixed(2));

        const responseData: any = {
            subtotal: subtotal.toFixed(2),
            shippingCharge: shippingCharge.toFixed(2),
            discount: discount.toFixed(2),
            discountMeta,
            total: total.toFixed(2),
        };

        if (submissionId) {
            responseData.serviceDuration = serviceDuration;
            responseData.serviceFees = serviceFees.toFixed(2);
        }

        return {
            success: true,
            statusCode: 200,
            message: "Cart summary fetched successfully",
            data: responseData,
        };
    }

    private async mapCart(cart: CartRecord, message: string) {
        let totalPrice = 0;

        const items = await Promise.all(
            cart.items.map(async (item) => {
                const resolvedImages = await Promise.all(
                    item.product.images.map(async (img) => ({
                        ...img,
                        fileUrl: await this.storageService.resolveKey(img.fileUrl),
                    })),
                );

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
                        description: item.product.description,
                        variants: item.product.variants,
                        images: resolvedImages,
                    },
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                };
            }),
        );

        return {
            success: true,
            statusCode: 200,
            message,
            data: {
                id: cart.id,
                totalItem: items.length,
                totalPrice: totalPrice.toFixed(2),
                items,
                createdAt: cart.createdAt,
                updatedAt: cart.updatedAt,
            },
        };
    }
}
