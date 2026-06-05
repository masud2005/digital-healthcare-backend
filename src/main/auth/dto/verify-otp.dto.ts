import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length } from "class-validator";

export class VerifyOtpDto {
    @ApiProperty({ example: "challenge_uuid" })
    @IsString()
    challengeId!: string;

    @ApiProperty({ example: "123456" })
    @IsString()
    @Length(6, 6)
    otp!: string;
}
