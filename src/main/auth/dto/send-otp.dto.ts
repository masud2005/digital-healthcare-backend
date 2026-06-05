import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsString } from "class-validator";

const otpPurposes = ["REGISTER", "LOGIN"] as const;
const otpMethods = ["EMAIL", "SMS"] as const;

export class SendOtpDto {
    @ApiProperty({ example: "uuid" })
    @IsString()
    userId!: string;

    @ApiProperty({ enum: otpPurposes, example: "REGISTER" })
    @IsIn(otpPurposes)
    purpose!: "REGISTER" | "LOGIN";

    @ApiProperty({ enum: otpMethods, example: "EMAIL" })
    @IsIn(otpMethods)
    method!: "EMAIL" | "SMS";
}
