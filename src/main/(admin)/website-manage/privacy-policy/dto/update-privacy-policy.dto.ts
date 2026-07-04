import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdatePrivacyPolicyDto {
    @ApiPropertyOptional({ description: "HTML content for Privacy Policy" })
    @IsOptional()
    @IsString()
    content?: string;
}
