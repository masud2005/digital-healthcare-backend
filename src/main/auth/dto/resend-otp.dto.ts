import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString, ValidateIf } from "class-validator";

const otpPurposes = ["REGISTER", "LOGIN"] as const;

export class ResendOtpDto {
    @ApiPropertyOptional({ example: "challenge_uuid" })
    @IsOptional()
    @IsString()
    challengeId?: string;

    @ApiPropertyOptional({ example: "user_uuid" })
    @ValidateIf((payload) => !payload.challengeId)
    @IsString()
    userId?: string;

    @ApiPropertyOptional({ enum: otpPurposes, example: "REGISTER" })
    @ValidateIf((payload) => !payload.challengeId)
    @IsIn(otpPurposes)
    purpose?: "REGISTER" | "LOGIN";
}
