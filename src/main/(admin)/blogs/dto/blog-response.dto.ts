import { AttachmentResponseDto } from "@global/attachment/dto/attachment-response.dto";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CategoryResponseDto } from "../../category/dto/category-response.dto";

export class BlogAuthorDto {
    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    id: string;

    @ApiProperty({ example: "Admin Name" })
    name: string;

    @ApiProperty({ example: "admin@example.com" })
    email: string;
}

export class BlogProviderDto {
    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    id: string;

    @ApiProperty({ example: "Dr. John Doe" })
    name: string;

    @ApiPropertyOptional({ type: AttachmentResponseDto, nullable: true })
    avatar: AttachmentResponseDto | null;
}

export class BlogResponseDto {
    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    id: string;

    @ApiProperty({ example: "Understanding GLP-1 Medications" })
    title: string;

    @ApiProperty({ example: "understanding-glp-1-medications" })
    slug: string;

    @ApiProperty({ example: "<p>Rich text content...</p>" })
    content: string;

    @ApiProperty({ example: true })
    isPublished: boolean;

    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    authorId: string;

    @ApiPropertyOptional({ type: BlogAuthorDto })
    author: BlogAuthorDto;

    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    categoryId: string;

    @ApiPropertyOptional({ type: CategoryResponseDto })
    category: CategoryResponseDto;

    @ApiPropertyOptional({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f", nullable: true })
    providerId: string | null;

    @ApiPropertyOptional({ type: BlogProviderDto, nullable: true })
    provider: BlogProviderDto | null;

    @ApiPropertyOptional({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f", nullable: true })
    featuredImageId: string | null;

    @ApiPropertyOptional({ type: AttachmentResponseDto, nullable: true })
    featuredImage: AttachmentResponseDto | null;

    @ApiProperty({ example: "2026-06-08T00:00:00.000Z" })
    createdAt: Date;

    @ApiProperty({ example: "2026-06-08T00:00:00.000Z" })
    updatedAt: Date;
}

class BlogListMetaDto {
    @ApiProperty({ example: 1 })
    page: number;

    @ApiProperty({ example: 10 })
    limit: number;

    @ApiProperty({ example: 25 })
    total: number;

    @ApiProperty({ example: 3 })
    totalPages: number;
}

export class BlogListResponseDto {
    @ApiProperty({ type: [BlogResponseDto] })
    data: BlogResponseDto[];

    @ApiProperty({ type: BlogListMetaDto })
    meta: BlogListMetaDto;
}
