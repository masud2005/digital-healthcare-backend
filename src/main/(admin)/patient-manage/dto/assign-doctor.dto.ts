import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class AssignDoctorDto {
    @ApiProperty({ example: "submission-uuid" })
    @IsUUID()
    submissionId: string;

    @ApiProperty({ example: "doctor-profile-uuid" })
    @IsUUID()
    doctorId: string;
}
