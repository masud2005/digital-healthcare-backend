import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { billingCycle, categoryStatus } from "@constant/enums";
import type { BillingCycle, CategoryStatus } from "@constant/enums";
import { AttachmentResponseDto } from "@global/attachment/dto/attachment-response.dto";

export class PaymentPlanResponseDto {
    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    id: string;

    @ApiProperty({ example: "49.99" })
    price: string;

    @ApiProperty({ enum: billingCycle, example: "MONTHLY" })
    billingCycle: BillingCycle;

    @ApiProperty({ example: "2026-05-18T04:00:00.000Z" })
    createdAt: Date;

    @ApiProperty({ example: "2026-05-18T04:00:00.000Z" })
    updatedAt: Date;
}

export class CategoryResponseDto {
    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    id: string;

    @ApiProperty({ example: "Cardiology" })
    name: string;

    @ApiPropertyOptional({ example: "Heart and cardiovascular care", nullable: true })
    description: string | null;

    @ApiProperty({ enum: categoryStatus, example: "ACTIVE" })
    status: CategoryStatus;

    @ApiPropertyOptional({ type: PaymentPlanResponseDto, nullable: true })
    paymentPlan: PaymentPlanResponseDto | null;

    @ApiPropertyOptional({ type: AttachmentResponseDto, nullable: true })
    icon: AttachmentResponseDto | null;

    @ApiProperty({ example: "2026-05-18T04:00:00.000Z" })
    createdAt: Date;

    @ApiProperty({ example: "2026-05-18T04:00:00.000Z" })
    updatedAt: Date;
}

class CategoryListMetaDto {
    @ApiProperty({ example: 1 })
    page: number;

    @ApiProperty({ example: 10 })
    limit: number;

    @ApiProperty({ example: 25 })
    total: number;

    @ApiProperty({ example: 3 })
    totalPages: number;
}

export class CategoryListResponseDto {
    @ApiProperty({ type: [CategoryResponseDto] })
    data: CategoryResponseDto[];

    @ApiProperty({ type: CategoryListMetaDto })
    meta: CategoryListMetaDto;
}
