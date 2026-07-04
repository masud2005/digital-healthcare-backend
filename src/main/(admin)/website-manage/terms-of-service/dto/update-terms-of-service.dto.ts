import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateTermsOfServiceDto {
    @ApiPropertyOptional({ description: "HTML content for Terms of Service" })
    @IsOptional()
    @IsString()
    content?: string;
}
