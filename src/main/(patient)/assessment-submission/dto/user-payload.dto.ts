export class UserPayloadDto {
    email: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
    otpChannel?: "EMAIL" | "SMS";
    challengeId?: string;
    otp?: string;
}
