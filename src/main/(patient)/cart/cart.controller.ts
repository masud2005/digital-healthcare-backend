import { CurrentUser } from "@common/decorators/current-user.decorator";
import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import type { AuthenticatedUser } from "@main/auth/auth.types";
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CartService } from "./cart.service";
import { AddToCartDto, CartItemParamDto, UpdateCartItemDto } from "./dto/cart.dto";

@ApiTags("Patient Cart")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("patient/cart")
export class CartController {
    constructor(private readonly cartService: CartService) {}

    @Post("add-cart")
    @ApiOperation({ summary: "Add product to cart", description: "Validates stock before adding. If the same product+size already exists, quantity is incremented." })
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
        description: "Pass quantity, size, or both. At least one field is required.",
    })
    @ApiOkResponse({ description: "Updated cart item" })
    updateCartItem(
        @Param() params: CartItemParamDto,
        @Body() dto: UpdateCartItemDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.cartService.updateCartItem(user.id, params.id, dto);
    }

    @Get("my-carts")
    @ApiOperation({ summary: "Get my cart with calculated total price" })
    @ApiOkResponse({ description: "Cart with items and totalPrice" })
    getMyCarts(@CurrentUser() user: AuthenticatedUser) {
        return this.cartService.getMyCarts(user.id);
    }
}
