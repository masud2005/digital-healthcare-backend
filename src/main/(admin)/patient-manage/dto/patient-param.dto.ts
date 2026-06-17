import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class PatientParamDto {
    @ApiProperty({ example: "uuid" })
    @IsUUID()
    id: string;
}
