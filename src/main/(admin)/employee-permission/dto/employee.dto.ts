import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { UserStatus } from "@prisma/client";
import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    MinLength,
    IsArray,
} from "class-validator";

export class CreateEmployeeDto {
    @ApiProperty({ description: "Full name of the employee" })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: "Email address/username of the employee" })
    @IsEmail()
    email: string;

    @ApiProperty({ description: "Password of the employee" })
    @IsString()
    @MinLength(8)
    password: string;

    @ApiProperty({ description: "Role ID to assign to this employee" })
    @IsString()
    @IsNotEmpty()
    roleId: string;

    @ApiPropertyOptional({
        description: "Specific permission IDs to assign to this employee",
        type: [String],
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    permissionIds?: string[];
}

export class UpdateEmployeeDto {
    @ApiPropertyOptional({ description: "Full name of the employee" })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({ description: "Email address/username of the employee" })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiPropertyOptional({
        description: "New password of the employee (leave empty to keep current)",
    })
    @IsString()
    @MinLength(8)
    @IsOptional()
    password?: string;

    @ApiPropertyOptional({ description: "Role ID to assign to this employee" })
    @IsString()
    @IsOptional()
    roleId?: string;

    @ApiPropertyOptional({
        description: "Specific permission IDs to assign to this employee",
        type: [String],
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    permissionIds?: string[];

    @ApiPropertyOptional({ enum: UserStatus, description: "Status of the employee account" })
    @IsEnum(UserStatus)
    @IsOptional()
    status?: UserStatus;
}
