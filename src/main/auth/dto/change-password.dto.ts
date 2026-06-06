import { ApiProperty } from "@nestjs/swagger";
import { IsString, Matches } from "class-validator";
import {
    strongPasswordExample,
    strongPasswordMessage,
    strongPasswordPattern,
} from "./password-validation.constants";
import { MatchesField } from "./matches-field.decorator";

export class ChangePasswordDto {
    @ApiProperty({ example: "currentPassword123" })
    @IsString()
    currentPassword!: string;

    @ApiProperty({
        example: strongPasswordExample,
        description:
            "At least 8 characters with uppercase, lowercase, number, and special character",
    })
    @IsString()
    @Matches(strongPasswordPattern, { message: strongPasswordMessage })
    newPassword!: string;

    @ApiProperty({
        example: strongPasswordExample,
        description: "Must match newPassword",
    })
    @IsString()
    @MatchesField("newPassword", "newPassword and confirmPassword do not match")
    confirmPassword!: string;
}
