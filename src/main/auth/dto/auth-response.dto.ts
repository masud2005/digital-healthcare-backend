import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AuthUserResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    email!: string;

    @ApiPropertyOptional()
    phone?: string | null;

    @ApiProperty({ type: [String], example: ["PATIENT"] })
    roles!: string[];

    @ApiProperty()
    status!: string;

    @ApiPropertyOptional()
    emailVerifiedAt?: Date | null;

    @ApiPropertyOptional()
    phoneVerifiedAt?: Date | null;

    @ApiProperty()
    mfaEnabled!: boolean;

    @ApiPropertyOptional()
    lastLoginAt?: Date | null;
}

export class AuthMessageResponseDto {
    @ApiProperty({ example: true })
    success!: boolean;

    @ApiProperty()
    message!: string;
}

export class AuthProfileResponseDto extends AuthMessageResponseDto {
    @ApiProperty({ type: AuthUserResponseDto })
    data!: AuthUserResponseDto;
}

export class AuthRegisterResponseDto extends AuthMessageResponseDto {
    @ApiProperty({
        example: {
            userId: "uuid",
            status: "PENDING_VERIFICATION",
        },
    })
    data!: {
        userId: string;
        status: string;
    };
}

export class AuthLoginResponseDto extends AuthMessageResponseDto {
    @ApiProperty({
        example: {
            userId: "uuid",
            email: "user@gmail.com",
            phone: "+8801700000000",
            status: "OTP_REQUIRED",
        },
    })
    data!: {
        userId: string;
        email: string;
        phone: string | null;
        status: string;
    };
}

export class AuthOtpResponseDto extends AuthMessageResponseDto {
    @ApiProperty({
        example: {
            challengeId: "challenge_uuid",
            userId: "user_uuid",
            purpose: "REGISTER",
            method: "EMAIL",
            expiresAt: "2026-06-05T10:00:00.000Z",
        },
    })
    data!: {
        challengeId: string;
        userId: string;
        purpose: string;
        method: string;
        expiresAt: Date;
    };
}

export class AuthResponseDto extends AuthMessageResponseDto {
    @ApiProperty({
        example: {
            accessToken: "jwt",
            tokenType: "Bearer",
            user: {
                id: "uuid",
                email: "user@gmail.com",
                phone: "+88017xxxxxxxx",
                status: "ACTIVE",
                roles: ["PATIENT"],
            },
        },
    })
    data!: {
        accessToken: string;
        tokenType: string;
        user: AuthUserResponseDto;
    };
}
