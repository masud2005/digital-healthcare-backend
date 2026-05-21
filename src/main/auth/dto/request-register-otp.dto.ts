import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class RequestRegisterOtpDto {
    @ApiProperty({ example: "Alan Cattach" })
    @IsString()
    name!: string;

    @ApiProperty({ example: "alan.cattach@gmail.com" })
    @IsEmail()
    email!: string;

    @ApiProperty({ example: "MyStrongPassword1!" })
    @IsString()
    @MinLength(8)
    password!: string;

    @ApiProperty({ example: "+1 234 567890", required: false })
    @IsOptional()
    @IsString()
    phoneNumber?: string;
}