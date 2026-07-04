import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateHippaNoticeDto {
    @ApiPropertyOptional({ description: "HTML content for HIPAA Notice" })
    @IsOptional()
    @IsString()
    content?: string;
}
