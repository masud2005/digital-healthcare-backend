import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class RequestLoginOtpDto {
    @ApiProperty({ example: "masud.softvenceomega@gmail.com" })
    @IsEmail()
    email!: string;

    @ApiProperty({ example: "12345678" })
    @IsString()
    @MinLength(8)
    password!: string;
}