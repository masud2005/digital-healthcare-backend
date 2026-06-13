import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString, Matches } from "class-validator";
import { MatchesField } from "./matches-field.decorator";
import {
    strongPasswordExample,
    strongPasswordMessage,
    strongPasswordPattern,
} from "./password-validation.constants";

export class RegisterDto {
    @ApiProperty({ example: "user@gmail.com" })
    @IsEmail()
    email!: string;

@ApiProperty({ example: "+880183414XXXX" })
    @IsNotEmpty()
    @IsPhoneNumber(undefined, { message: "Phone number must be a valid international number with country code (e.g., +88018XXXXXXXX)" })
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
