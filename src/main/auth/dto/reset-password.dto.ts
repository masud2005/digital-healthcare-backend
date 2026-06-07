import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length, Matches } from "class-validator";
import {
    strongPasswordExample,
    strongPasswordMessage,
    strongPasswordPattern,
} from "./password-validation.constants";
import { MatchesField } from "./matches-field.decorator";

export class ResetPasswordDto {
    @ApiProperty({ example: "challenge_uuid" })
    @IsString()
    @Length(36, 36)
    challengeId!: string;

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
