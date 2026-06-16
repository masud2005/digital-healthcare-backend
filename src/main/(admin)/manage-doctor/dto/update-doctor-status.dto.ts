import { ApiProperty } from "@nestjs/swagger";
import { userStatus } from "@constant/enums";
import { IsEnum } from "class-validator";
import type { UserStatus } from "@constant/enums";

export class UpdateDoctorStatusDto {
    @ApiProperty({ enum: userStatus, example: "ACTIVE" })
    @IsEnum(userStatus)
    status: UserStatus;
}
