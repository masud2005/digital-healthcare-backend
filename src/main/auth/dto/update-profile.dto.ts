import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsUUID } from "class-validator";

export class UpdateProfileDto {
    @ApiPropertyOptional({ example: "uuid", description: "Attachment ID from POST /attachments/upload" })
    @IsOptional()
    @IsUUID()
    avatarId?: string;

    @ApiPropertyOptional({ example: "John Doe" })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ example: "Some bio" })
    @IsOptional()
    @IsString()
    bio?: string;

    // Doctor / Admin only
    @ApiPropertyOptional({ example: "FNP-BC" })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional({ example: "Cardiology" })
    @IsOptional()
    @IsString()
    specialty?: string;

    @ApiPropertyOptional({ example: "Colorado Springs" })
    @IsOptional()
    @IsString()
    officeLocation?: string;

    // Patient only
    @ApiPropertyOptional({ example: "123 Main St" })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional({ example: "Denver" })
    @IsOptional()
    @IsString()
    city?: string;

    @ApiPropertyOptional({ example: "CO" })
    @IsOptional()
    @IsString()
    state?: string;

    @ApiPropertyOptional({ example: "80201" })
    @IsOptional()
    @IsString()
    zipCode?: string;
}
