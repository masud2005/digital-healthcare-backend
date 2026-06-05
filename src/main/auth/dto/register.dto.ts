import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, MinLength, ValidateIf } from "class-validator";

export class RegisterDto {
    @ApiProperty({ example: "user@gmail.com" })
    @IsEmail()
    email!: string;

    @ApiProperty({ example: "+88017xxxxxxxx" })
    @IsString()
    phone!: string;

    @ApiProperty({ example: "123456" })
    @IsString()
    @MinLength(6)
    password!: string;

    @ApiProperty({ example: "123456" })
    @IsString()
    @MinLength(6)
    confirmPassword!: string;

    @ApiPropertyOptional({ example: "User Name" })
    @IsOptional()
    @IsString()
    @ValidateIf((_, value) => value !== null && value !== undefined)
    name?: string;
}
