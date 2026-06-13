import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { userStatus } from "@constant/enums";
import type { UserStatus } from "@constant/enums";

export class DoctorResponseDto {
    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    id: string;

    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    userId: string;

    @ApiProperty({ example: "Dr. Runa Pradhan NP" })
    fullName: string;

    @ApiPropertyOptional({ example: "doctor-avatar.jpg", nullable: true })
    thumbnail: string | null;

    @ApiPropertyOptional({ example: "FNP-BC", nullable: true })
    roleTitle: string | null;

    @ApiPropertyOptional({ example: "Licensed Colorado-Nurse Practitioner - Family", nullable: true })
    shortBio: string | null;

    @ApiProperty({ example: "runa.pradhannp@gmail.com" })
    email: string;

    @ApiPropertyOptional({ example: "Colorado Springs", nullable: true })
    officeLocation: string | null;

    @ApiProperty({ enum: userStatus, example: "ACTIVE" })
    status: UserStatus;

    @ApiProperty({ example: 5 })
    activeConsultation: number;

    @ApiProperty({ example: "2026-05-18T04:00:00.000Z" })
    createdAt: Date;

    @ApiProperty({ example: "2026-05-18T04:00:00.000Z" })
    updatedAt: Date;
}

class DoctorListMetaDto {
    @ApiProperty({ example: 1 })
    page: number;

    @ApiProperty({ example: 10 })
    limit: number;

    @ApiProperty({ example: 25 })
    total: number;

    @ApiProperty({ example: 3 })
    totalPages: number;
}

export class DoctorListResponseDto {
    @ApiProperty({ type: [DoctorResponseDto] })
    data: DoctorResponseDto[];

    @ApiProperty({ type: DoctorListMetaDto })
    meta: DoctorListMetaDto;
}

export class DoctorTitleListResponseDto {
    @ApiProperty({ type: [String], example: ["FNP-BC", "APNP"] })
    data: string[];
}
