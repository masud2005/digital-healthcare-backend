import { ApiProperty } from "@nestjs/swagger";
import { PageType } from "@prisma/client";
import { IsEnum, IsNotEmpty } from "class-validator";

export class GetFaqQueryDto {
    @ApiProperty({ enum: PageType, description: "Filter by page type (mandatory)" })
    @IsEnum(PageType)
    @IsNotEmpty()
    pageType: PageType;
}
