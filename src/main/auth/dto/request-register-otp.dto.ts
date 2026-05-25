import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class RequestRegisterOtpDto {
    @ApiProperty({ example: "alan.cattach@gmail.com" })
    @IsEmail()
    email!: string;

    @ApiProperty({ example: "MyStrongPassword1!" })
    @IsString()
    @MinLength(8)
    password!: string;

    @ApiProperty({ example: "MyStrongPassword1!" })
    @IsString()
    @MinLength(8)
    confirmPassword!: string;
}