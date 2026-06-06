import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";
import { strongPasswordExample } from "./password-validation.constants";

export class LoginDto {
    @ApiProperty({ example: "user@gmail.com" })
    @IsEmail()
    email!: string;

    @ApiProperty({ example: strongPasswordExample })
    @IsString()
    password!: string;
}
