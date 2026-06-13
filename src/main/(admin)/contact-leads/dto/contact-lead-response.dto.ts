import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ContactLeadResponseDto {
    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    id: string;

    @ApiProperty({ example: "John Doe" })
    fullName: string;

    @ApiProperty({ example: "john@example.com" })
    email: string;

    @ApiPropertyOptional({ example: "+1 555 0100", nullable: true })
    phone: string | null;

    @ApiPropertyOptional({ example: "Medical Weight Loss", nullable: true })
    service: string | null;

    @ApiPropertyOptional({ example: "I would like to schedule a consultation.", nullable: true })
    message: string | null;

    @ApiProperty({ example: false })
    read: boolean;

    @ApiProperty({ example: false })
    responded: boolean;

    @ApiPropertyOptional({
        example: "https://minio.example.com/testing/2026-06-08/file.pdf",
        nullable: true,
    })
    attachments: string | null;

    @ApiPropertyOptional({ example: "Welcome to Weight Loss MD", nullable: true })
    responseSubject: string | null;

    @ApiPropertyOptional({ example: "Dear Jessica...", nullable: true })
    responseMessage: string | null;

    @ApiPropertyOptional({
        example: "https://minio.example.com/testing/2026-06-08/file.pdf",
        nullable: true,
    })
    responseAttachments: string | null;

    @ApiPropertyOptional({ example: "2026-05-18T04:00:00.000Z", nullable: true })
    respondedAt: Date | null;

    @ApiProperty({ example: "2026-05-18T04:00:00.000Z" })
    createdAt: Date;

    @ApiProperty({ example: "2026-05-18T04:00:00.000Z" })
    updatedAt: Date;
}

class ContactLeadListMetaDto {
    @ApiProperty({ example: 1 })
    page: number;

    @ApiProperty({ example: 10 })
    limit: number;

    @ApiProperty({ example: 25 })
    total: number;

    @ApiProperty({ example: 3 })
    totalPages: number;
}

export class ContactLeadListResponseDto {
    @ApiProperty({ type: [ContactLeadResponseDto] })
    data: ContactLeadResponseDto[];

    @ApiProperty({ type: ContactLeadListMetaDto })
    meta: ContactLeadListMetaDto;
}
