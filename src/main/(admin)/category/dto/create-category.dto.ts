import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { billingCycle, categoryStatus } from "@constant/enums";
import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, ValidateNested } from "class-validator";
import type { BillingCycle, CategoryStatus } from "@constant/enums";

export class CreatePaymentPlanDto {
    @ApiProperty({ example: 49.99 })
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    price: number;

    @ApiPropertyOptional({ enum: billingCycle, example: "MONTHLY" })
    @IsOptional()
    @IsEnum(billingCycle)
    billingCycle?: BillingCycle;
}

export class CreateCategoryDto {
    @ApiProperty({ example: "Cardiology" })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ example: "Heart and cardiovascular care" })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ enum: categoryStatus, example: "ACTIVE" })
    @IsOptional()
    @IsEnum(categoryStatus)
    status?: CategoryStatus;

    @ApiPropertyOptional({ type: CreatePaymentPlanDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => CreatePaymentPlanDto)
    paymentPlan?: CreatePaymentPlanDto;

    @ApiPropertyOptional({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f", description: "Attachment id for category icon" })
    @IsOptional()
    @IsString()
    iconId?: string;
}
