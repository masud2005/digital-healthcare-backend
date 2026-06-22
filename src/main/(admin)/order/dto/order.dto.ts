import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { OrderStatus } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";

export type DateRangeFilter = "TODAY" | "LAST_7_DAYS" | "LAST_MONTH" | "LAST_YEAR" | "ALL";

// ─── Query DTO ───────────────────────────────────────────────────────────────

export class OrderQueryDto {
    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @ApiPropertyOptional({ example: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number;

    @ApiPropertyOptional({ example: "ORD-2026-00123", description: "Search by orderId (orderNumber)" })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ enum: OrderStatus, description: "Filter by order status" })
    @IsOptional()
    @IsEnum(OrderStatus)
    status?: OrderStatus;

    @ApiPropertyOptional({ example: "Dr. Emily Chen", description: "Filter by doctor name" })
    @IsOptional()
    @IsString()
    doctorName?: string;

    @ApiPropertyOptional({
        enum: ["TODAY", "LAST_7_DAYS", "LAST_MONTH", "LAST_YEAR", "ALL"],
        description: "Filter by date range",
    })
    @IsOptional()
    @IsString()
    dateRange?: DateRangeFilter;
}

// ─── List DTOs ───────────────────────────────────────────────────────────────

export class OrderListItemDto {
    @ApiProperty({ example: "uuid-1234" }) id: string;
    @ApiProperty({ example: "ORD-2026-00123" }) orderNumber: string;
    @ApiProperty({ example: 2 }) itemCount: number;
    @ApiProperty({ example: 1019.0 }) total: number;
    @ApiProperty({ example: "Arlene McCoy" }) patientName: string;
    @ApiProperty({ example: "Cody Fisher" }) doctorName: string;
    @ApiProperty({ example: "2026-05-25" }) date: Date;
    @ApiProperty({ example: "APPROVED" }) status: string;
}

export class OrderListResponseDto {
    @ApiProperty({ type: [OrderListItemDto] }) orders: OrderListItemDto[];
    @ApiProperty() meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// ─── Detail DTO ──────────────────────────────────────────────────────────────

export class OrderDetailItemDto {
    @ApiProperty({ example: "item-123" }) id: string;
    @ApiProperty({ example: "Phentermine" }) productName: string;
    @ApiProperty({ example: "37.5mg (28 tablets)" }) variantSize: string | null;
    @ApiProperty({ example: 65.0 }) unitPrice: number;
    @ApiProperty({ example: 2 }) quantity: number;
    @ApiProperty({ example: 130.0 }) totalPrice: number;
    @ApiPropertyOptional({ example: "url-to-image" }) productImage: string | null;
}

export class OrderDetailResponseDto {
    @ApiProperty({ example: "uuid-1234" }) id: string;
    @ApiProperty({ example: "ORD-2026-00123" }) orderNumber: string;
    @ApiProperty({ example: "2026-05-23" }) orderDate: Date;
    @ApiProperty({ example: "David Wilson" }) patientName: string;
    @ApiProperty({ example: "Dr. Emily Chen" }) doctorName: string;
    @ApiProperty({ example: "IN_PROGRESS" }) status: string;

    @ApiProperty({ type: [OrderDetailItemDto] }) items: OrderDetailItemDto[];

    @ApiProperty({ example: 110.0 }) subtotal: number;
    @ApiProperty({ example: 0 }) discountAmount: number;
    @ApiProperty({ example: 0 }) shippingAmount: number;
    @ApiProperty({ example: 110.0 }) totalAmount: number;

    @ApiPropertyOptional() shippingAddress: {
        name: string | null;
        phone: string | null;
        address: string | null;
        city: string | null;
        state: string | null;
        zip: string | null;
        country: string | null;
    } | null;

    @ApiPropertyOptional() paymentDetails: {
        method: string;
        last4: string | null;
        brand: string | null;
        totalAmount: number;
        status: string;
        transactionId: string;
    } | null;

    @ApiPropertyOptional() shippingInfo: {
        carrierName: string | null;
        trackingNumber: string | null;
    } | null;
}

// ─── Update DTO ──────────────────────────────────────────────────────────────

export class UpdateOrderDto {
    @ApiPropertyOptional({ enum: OrderStatus })
    @IsOptional()
    @IsEnum(OrderStatus)
    status?: OrderStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    trackingCarrier?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    trackingNumber?: string;
}
