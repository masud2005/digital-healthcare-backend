import { attachmentContext, type AttachmentContext } from "@constant/enums";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer"; // এই ইমপোর্টটি যুক্ত করুন
import { IsEnum, IsInt, IsOptional, Min } from "class-validator";

export class GetAttachmentsQueryDto {
    @ApiPropertyOptional({ description: "Page number for pagination", default: 1 })
    @IsOptional()
    @Type(() => Number) // এটি নিশ্চিতভাবে স্ট্রিং "1" কে নম্বর ১ বানিয়ে দেবে
    @IsInt()
    @Min(1)
    page?: number;

    @ApiPropertyOptional({ description: "Number of records per page", default: 10 })
    @IsOptional()
    @Type(() => Number) // এটি নিশ্চিতভাবে স্ট্রিং "10" কে নম্বর ১০ বানিয়ে দেবে
    @IsInt()
    @Min(1)
    limit?: number;

    @ApiPropertyOptional({
        enum: attachmentContext,
        description: "Filter attachments by specific context",
    })
    @IsOptional()
    @IsEnum(attachmentContext)
    context?: AttachmentContext;
}
