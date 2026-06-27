import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateRoleDto {
    @ApiProperty({ description: "Unique name of the role (e.g. GENERAL_MANAGER)" })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ description: "Human-readable name of the role" })
    @IsString()
    @IsOptional()
    displayName?: string;

    @ApiPropertyOptional({ description: "Brief description of the role's purpose" })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ description: "List of permission IDs to assign to this role", type: [String] })
    @IsArray()
    @IsString({ each: true })
    permissionIds: string[];
}

export class UpdateRoleDto {
    @ApiPropertyOptional({ description: "Human-readable name of the role" })
    @IsString()
    @IsOptional()
    displayName?: string;

    @ApiPropertyOptional({ description: "Brief description of the role's purpose" })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ description: "List of permission IDs to assign to this role", type: [String] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    permissionIds?: string[];

    @ApiPropertyOptional({ description: "Whether the role is active or not" })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
