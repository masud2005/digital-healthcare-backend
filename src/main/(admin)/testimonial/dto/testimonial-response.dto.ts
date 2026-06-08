import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class TestimonialResponseDto {
    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    id: string;

    @ApiProperty({ example: "John Doe" })
    clientName: string;

    @ApiPropertyOptional({ example: "The care team was excellent.", nullable: true })
    feedback: string | null;

    @ApiProperty({ example: 5 })
    rating: number;

    @ApiProperty({ example: "2026-06-08T00:00:00.000Z" })
    date: Date;

    @ApiProperty({ example: "2026-06-08T00:00:00.000Z" })
    createdAt: Date;

    @ApiProperty({ example: "2026-06-08T00:00:00.000Z" })
    updatedAt: Date;
}

class TestimonialListMetaDto {
    @ApiProperty({ example: 1 })
    page: number;

    @ApiProperty({ example: 10 })
    limit: number;

    @ApiProperty({ example: 25 })
    total: number;

    @ApiProperty({ example: 3 })
    totalPages: number;
}

export class TestimonialListResponseDto {
    @ApiProperty({ type: [TestimonialResponseDto] })
    data: TestimonialResponseDto[];

    @ApiProperty({ type: TestimonialListMetaDto })
    meta: TestimonialListMetaDto;
}
