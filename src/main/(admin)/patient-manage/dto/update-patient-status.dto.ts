import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { UserStatus } from "@prisma/client";

export class UpdatePatientStatusDto {
    @ApiProperty({ enum: UserStatus, example: "ACTIVE" })
    @IsEnum(UserStatus)
    status: UserStatus;
}
