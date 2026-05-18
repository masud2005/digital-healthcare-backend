import { ApiProperty } from "@nestjs/swagger";

export class CategoryParamDto {
    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    id: string;
}
