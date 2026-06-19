import { CurrentUser } from "@common/decorators/current-user.decorator";
import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import type { AuthenticatedUser } from "@main/auth/auth.types";
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CartService } from "./cart.service";
import { AddToCartDto, CartItemParamDto, CartSummaryQueryDto, UpdateCartItemDto } from "./dto/cart.dto";

@ApiTags("(Patient) Product Cart")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("patient/cart")
export class CartController {
    constructor(private readonly cartService: CartService) {}

    @Post("add-cart")
    @ApiOperation({
        summary: "Add product to cart",
        description:
            "Adds a product with default quantity 1. " +
            "If the same product already exists in cart, quantity is incremented by 1. " +
            "Use PATCH /:id to set size or adjust quantity after adding.",
    })
    @ApiOkResponse({ description: "Updated cart" })
    addToCart(@Body() dto: AddToCartDto, @CurrentUser() user: AuthenticatedUser) {
        return this.cartService.addToCart(user.id, dto);
    }

    @Delete("remove-cart/:id")
    @ApiOperation({ summary: "Remove a cart item by id" })
    @ApiOkResponse({ description: "Item removed" })
    removeFromCart(@Param() params: CartItemParamDto, @CurrentUser() user: AuthenticatedUser) {
        return this.cartService.removeFromCart(user.id, params.id);
    }

    @Patch(":id")
    @ApiOperation({
        summary: "Update cart item quantity and/or size",
        description:
            "Pass quantity, size, or both. At least one field is required. " +
            "For products with variants, size must match an available variant. " +
            "Stock is validated against the selected variant's stockQuantity.",
    })
    @ApiOkResponse({ description: "Updated cart" })
    updateCartItem(
        @Param() params: CartItemParamDto,
        @Body() dto: UpdateCartItemDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.cartService.updateCartItem(user.id, params.id, dto);
    }

    @Get("my-carts")
    @ApiOperation({
        summary: "Get my cart",
        description:
            "Returns cart with all items. Each item shows unitPrice (variant price if size is set), " +
            "itemTotal, and overall totalPrice.",
    })
    @ApiOkResponse({ description: "Cart with items and totalPrice" })
    getMyCarts(@CurrentUser() user: AuthenticatedUser) {
        return this.cartService.getMyCarts(user.id);
    }

    @Get("summary")
    @ApiOperation({
        summary: "Get cart summary",
        description:
            "Returns subtotal, serviceDuration, serviceFees, shippingCharge, discount, and total. " +
            "Pass optional discountCode query param to apply a discount.",
    })
    @ApiOkResponse({ description: "Cart summary" })
    getCartSummary(@CurrentUser() user: AuthenticatedUser, @Query() query: CartSummaryQueryDto) {
        return this.cartService.getCartSummary(user.id, query.discountCode);
    }
}
