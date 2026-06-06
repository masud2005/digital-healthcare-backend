import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Matches } from "class-validator";
import {
    strongPasswordExample,
    strongPasswordMessage,
    strongPasswordPattern,
} from "./password-validation.constants";
import { MatchesField } from "./matches-field.decorator";

export class RegisterDto {
    @ApiProperty({ example: "user@gmail.com" })
    @IsEmail()
    email!: string;

    @ApiProperty({ example: "+88017xxxxxxxx" })
    @IsString()
    phone!: string;

    @ApiProperty({
        example: strongPasswordExample,
        description:
            "At least 8 characters with uppercase, lowercase, number, and special character",
    })
    @IsString()
    @Matches(strongPasswordPattern, { message: strongPasswordMessage })
    password!: string;

    @ApiProperty({
        example: strongPasswordExample,
        description: "Must match password",
    })
    @IsString()
    @MatchesField("password", "Password and confirmPassword do not match")
    confirmPassword!: string;
}
