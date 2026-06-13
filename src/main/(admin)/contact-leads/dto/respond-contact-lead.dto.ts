import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class RespondContactLeadDto {
    @ApiProperty({ example: "Welcome to Weight Loss MD" })
    @IsString()
    @IsNotEmpty()
    subject: string;

    @ApiProperty({ example: "Dear Jessica, we are glad to assist you..." })
    @IsString()
    @IsNotEmpty()
    message: string;

    @ApiPropertyOptional({
        type: "string",
        format: "binary",
        description: "Response attachment file",
    })
    @IsOptional()
    @IsString()
    attachments?: string;
}
