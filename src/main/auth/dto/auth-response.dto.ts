import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AuthUserResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    name!: string;

    @ApiProperty()
    email!: string;

    @ApiProperty()
    role!: string;

    @ApiProperty()
    status!: string;

    @ApiPropertyOptional()
    phoneNumber?: string | null;

    @ApiPropertyOptional()
    addressLine1?: string | null;

    @ApiPropertyOptional()
    addressLine2?: string | null;

    @ApiPropertyOptional()
    city?: string | null;

    @ApiPropertyOptional()
    state?: string | null;

    @ApiPropertyOptional()
    zip?: string | null;
}

export class AuthResponseDto {
    @ApiProperty()
    accessToken!: string;

    @ApiProperty({ example: "Bearer" })
    tokenType!: string;

    @ApiProperty({ type: AuthUserResponseDto })
    user!: AuthUserResponseDto;

    @ApiProperty({ example: false })
    profileComplete!: boolean;
}

export class AuthProfileResponseDto {
    @ApiProperty({ type: AuthUserResponseDto })
    user!: AuthUserResponseDto;

    @ApiProperty({ example: false })
    profileComplete!: boolean;
}

export class AuthMessageResponseDto {
    @ApiProperty()
    message!: string;
}