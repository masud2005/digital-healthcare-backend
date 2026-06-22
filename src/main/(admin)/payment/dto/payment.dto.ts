import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PaymentItemType, PaymentStatus } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";

// ─── Query ────────────────────────────────────────────────────────────────────

export class PaymentQueryDto {
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

    @ApiPropertyOptional({ example: "Jessica", description: "Search by patient name" })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ enum: PaymentItemType, description: "Filter by payment type" })
    @IsOptional()
    @IsEnum(PaymentItemType)
    paymentType?: PaymentItemType;

    @ApiPropertyOptional({ enum: PaymentStatus, description: "Filter by payment status" })
    @IsOptional()
    @IsEnum(PaymentStatus)
    status?: PaymentStatus;
}

// ─── List Item ────────────────────────────────────────────────────────────────

export class PaymentListItemDto {
    @ApiProperty({ example: "pay-uuid-1234" }) id: string;
    @ApiProperty({ example: "Jessica Martinez" }) patientName: string;
    @ApiPropertyOptional({ example: "3456", nullable: true }) last4: string | null;
    @ApiPropertyOptional({ example: "Visa", nullable: true }) brand: string | null;
    @ApiProperty({ example: "TXN-CLVR-123" }) transactionId: string;
    @ApiProperty({ example: "Product, Fees" }) paymentType: string;
    @ApiProperty({ example: 152.0 }) amount: number;
    @ApiProperty({ example: "2026-04-04T00:00:00.000Z" }) date: Date;
    @ApiProperty({ example: "COMPLETED" }) status: string;
}

export class PaymentListResponseDto {
    @ApiProperty({ type: [PaymentListItemDto] }) payments: PaymentListItemDto[];
    @ApiProperty() meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// ─── Detail ───────────────────────────────────────────────────────────────────

export class PaymentDetailDto {
    @ApiProperty({ example: "pay-uuid-1234" }) id: string;
    @ApiProperty({ example: "TXN-CLVR-123" }) transactionId: string;
    @ApiProperty({ example: 152.0 }) amount: number;
    @ApiProperty({ example: "USD" }) currency: string;
    @ApiProperty({ example: "COMPLETED" }) status: string;
    @ApiProperty({ example: "CARD" }) method: string;
    @ApiPropertyOptional({ example: "3456", nullable: true }) last4: string | null;
    @ApiPropertyOptional({ example: "Visa", nullable: true }) brand: string | null;
    @ApiProperty({ example: "Product, Fees" }) paymentType: string;
    @ApiPropertyOptional({ nullable: true }) paidAt: Date | null;
    @ApiPropertyOptional({ nullable: true }) failedAt: Date | null;
    @ApiPropertyOptional({ nullable: true }) refundedAt: Date | null;
    @ApiProperty() createdAt: Date;

    @ApiPropertyOptional({ nullable: true }) patient: {
        id: string;
        name: string | null;
        email: string;
        address: string | null;
        bio: string | null;
        phone: string | null;
        city: string | null;
        state: string | null;
        zip: string | null;
    } | null;

    @ApiPropertyOptional({ nullable: true }) order: {
        id: string;
        orderNumber: string;
        status: string;
        subtotal: number;
        discountAmount: number;
        shippingAmount: number;
        total: number;
        items: Array<{
            id: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
            productName: string;
            variantSize: string | null;
        }>;
    } | null;

    @ApiPropertyOptional({ nullable: true }) subscription: {
        id: string;
        status: string;
        startDate: Date;
        endDate: Date | null;
        nextBillingDate: Date | null;
        categoryName: string;
        paymentPlanName: string;
    } | null;
}
