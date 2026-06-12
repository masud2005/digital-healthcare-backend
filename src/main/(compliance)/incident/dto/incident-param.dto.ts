import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class IncidentParamDto {
    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    @IsUUID()
    id: string;
}
