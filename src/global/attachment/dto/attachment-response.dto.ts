import { attachmentContext } from "@constant/enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AttachmentResponseDto {
    @ApiProperty() id!: string;
    @ApiProperty() fileName!: string;
    @ApiProperty() fileUrl!: string;
    @ApiProperty() fileType!: string;
    @ApiProperty() fileSize!: number;
    @ApiProperty({ enum: attachmentContext }) context!: string;
    @ApiPropertyOptional() uploadedById?: string | null;
    @ApiProperty() createdAt!: Date;
    @ApiProperty() updatedAt!: Date;
}

export class PaginatedAttachmentMetaDto {
    @ApiProperty({ example: 100, description: "Total number of attachments" })
    totalItems!: number;

    @ApiProperty({ example: 10, description: "Total number of pages" })
    totalPages!: number;

    @ApiProperty({ example: 1, description: "Current page number" })
    currentPage!: number;

    @ApiProperty({ example: 10, description: "Number of items per page" })
    limit!: number;
}

export class PaginatedAttachmentResponseDto {
    @ApiProperty({ example: true })
    success!: boolean;

    @ApiProperty({ example: "Attachments fetched successfully" })
    message!: string;

    @ApiProperty({ type: [AttachmentResponseDto] })
    data!: AttachmentResponseDto[];

    @ApiProperty({ type: PaginatedAttachmentMetaDto })
    meta!: PaginatedAttachmentMetaDto;
}