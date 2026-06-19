import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

// ─── List ─────────────────────────────────────────────────────────────────────

export class MyOrderSubmissionRefDto {
    @ApiProperty({ example: "sub-uuid-1234" }) id: string;
    @ApiProperty({ example: "Weight Loss" }) assessmentTitle: string;
}

export class MyOrderApprovedByDto {
    @ApiProperty({ example: "doctor-user-uuid" }) id: string;
    @ApiPropertyOptional({ example: "Dr. Emily Chen", nullable: true }) name: string | null;
}

export class MyOrderListItemDto {
    @ApiProperty({ example: "ord-uuid-1234" }) id: string;
    @ApiProperty({ example: "ORD-2026-10245" }) orderNumber: string;
    @ApiProperty({ example: "PENDING" }) status: string;
    @ApiProperty({ example: 110.0 }) total: number;
    @ApiProperty({ example: 2 }) itemCount: number;
    @ApiProperty({ example: "2026-05-31T00:00:00.000Z" }) createdAt: Date;
    @ApiPropertyOptional({ example: "TXN-CLVR-123", nullable: true }) transactionId: string | null;
    @ApiPropertyOptional({ type: MyOrderApprovedByDto, nullable: true }) reviewedBy: MyOrderApprovedByDto | null;
    @ApiPropertyOptional({ type: MyOrderSubmissionRefDto, nullable: true }) submission: MyOrderSubmissionRefDto | null;
}

export class MyOrderListResponseDto {
    @ApiProperty({ type: [MyOrderListItemDto] }) orders: MyOrderListItemDto[];
    @ApiProperty({
        example: { PENDING: 3, CONFIRMED: 2, SHIPPED: 1 },
        description: "Count of orders grouped by status",
    })
    counts: Record<string, number>;
}

// ─── Detail ───────────────────────────────────────────────────────────────────

export class MyOrderItemDto {
    @ApiProperty({ example: "Phentermine" }) name: string;
    @ApiPropertyOptional({ example: "37.5mg", nullable: true }) size: string | null;
    @ApiPropertyOptional({ example: "https://...", nullable: true }) image: string | null;
    @ApiProperty({ example: 2 }) quantity: number;
    @ApiProperty({ example: 65.0 }) unitPrice: number;
    @ApiProperty({ example: 130.0 }) totalPrice: number;
}

export class MyOrderInfoDto {
    @ApiProperty({ example: "ord-uuid-1234" }) orderId: string;
    @ApiProperty({ example: "ORD-2026-10245" }) orderNumber: string;
    @ApiPropertyOptional({ example: "TXN-CLVR-123", nullable: true }) transactionId: string | null;
    @ApiProperty({ example: "CONFIRMED" }) orderStatus: string;
    @ApiPropertyOptional({ example: "David Wilson", nullable: true }) patientName: string | null;
    @ApiPropertyOptional({ type: MyOrderApprovedByDto, nullable: true }) approvedBy: MyOrderApprovedByDto | null;
}

export class MyOrderShippingAddressDto {
    @ApiPropertyOptional({ nullable: true }) name: string | null;
    @ApiPropertyOptional({ nullable: true }) address: string | null;
    @ApiPropertyOptional({ nullable: true }) city: string | null;
    @ApiPropertyOptional({ nullable: true }) state: string | null;
    @ApiPropertyOptional({ nullable: true }) zip: string | null;
    @ApiPropertyOptional({ nullable: true }) country: string | null;
}

export class MyOrderPaymentDetailsDto {
    @ApiPropertyOptional({ nullable: true }) paymentDate: Date | null;
    @ApiProperty({ example: "TXN-CLVR-123" }) transactionId: string;
    @ApiPropertyOptional({ example: "Visa", nullable: true }) cardBrand: string | null;
    @ApiPropertyOptional({ example: "5555", nullable: true }) last4: string | null;
    @ApiProperty({ example: 110.0 }) totalAmount: number;
    @ApiProperty({ example: "COMPLETED" }) paymentStatus: string;
}

export class MyOrderShippingInfoDto {
    @ApiPropertyOptional({ example: "FedEx", nullable: true }) trackingCarrier: string | null;
    @ApiPropertyOptional({ example: "FX8734523421", nullable: true }) trackingNumber: string | null;
}

export class MyOrderSubmissionDetailDto {
    @ApiProperty({ example: "sub-uuid" }) id: string;
    @ApiProperty({ example: "assessment-uuid" }) assessmentId: string;
    @ApiProperty({ example: "Weight Loss" }) assessmentTitle: string;
}

export class MyOrderDetailDto {
    @ApiProperty({ example: "ord-uuid" }) id: string;
    @ApiProperty({ example: "ORD-2026-10245" }) orderNumber: string;
    @ApiProperty({ example: "CONFIRMED" }) status: string;
    @ApiProperty() createdAt: Date;
    @ApiPropertyOptional({ nullable: true }) confirmedAt: Date | null;
    @ApiPropertyOptional({ nullable: true }) shippedAt: Date | null;
    @ApiPropertyOptional({ nullable: true }) deliveredAt: Date | null;
    @ApiPropertyOptional({ nullable: true }) cancelledAt: Date | null;
    @ApiProperty({ type: MyOrderInfoDto }) orderInfo: MyOrderInfoDto;
    @ApiProperty({ type: [MyOrderItemDto] }) items: MyOrderItemDto[];
    @ApiProperty({ example: 90.0 }) subtotal: number;
    @ApiProperty({ example: 10.0 }) discountAmount: number;
    @ApiProperty({ example: 20.0 }) shippingAmount: number;
    @ApiProperty({ example: 110.0 }) total: number;
    @ApiProperty({ type: MyOrderShippingAddressDto }) shippingAddress: MyOrderShippingAddressDto;
    @ApiPropertyOptional({ type: MyOrderPaymentDetailsDto, nullable: true }) paymentDetails: MyOrderPaymentDetailsDto | null;
    @ApiProperty({ type: MyOrderShippingInfoDto }) shippingInfo: MyOrderShippingInfoDto;
    @ApiPropertyOptional({ type: MyOrderSubmissionDetailDto, nullable: true }) submission: MyOrderSubmissionDetailDto | null;
}
