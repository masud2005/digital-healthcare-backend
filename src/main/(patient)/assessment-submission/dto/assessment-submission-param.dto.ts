import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class AssessmentParamDto {
    @ApiProperty({ example: "00b21a00-28d8-4054-8c45-f074d2bfbbf1" })
    @IsUUID()
    id: string;
}
