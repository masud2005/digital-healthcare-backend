import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateBlogDto {
    @ApiProperty({ example: "Understanding GLP-1 Medications" })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ example: "<p>Rich text HTML content from QuillJS...</p>" })
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiProperty({
        example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f",
        description: "Existing Category ID",
    })
    @IsUUID()
    @IsNotEmpty()
    categoryId: string;

    @ApiPropertyOptional({
        example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f",
        description: "Optional Provider (DoctorProfile) ID",
    })
    @IsOptional()
    @IsUUID()
    providerId?: string;

    @ApiPropertyOptional({
        example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f",
        description: "Optional Featured Image (Attachment) ID",
    })
    @IsOptional()
    @IsUUID()
    featuredImageId?: string;

    @ApiPropertyOptional({ example: true, type: Boolean })
    @IsOptional()
    @IsBoolean()
    isPublished?: boolean;
}
