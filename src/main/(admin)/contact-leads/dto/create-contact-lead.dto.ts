import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateContactLeadDto {
    @ApiProperty({ example: "John Doe" })
    @IsString()
    @IsNotEmpty()
    fullName: string;

    @ApiProperty({ example: "john@example.com" })
    @IsEmail()
    email: string;

    @ApiPropertyOptional({ example: "+1 555 0100" })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({ example: "Medical Weight Loss" })
    @IsOptional()
    @IsString()
    service?: string;

    @ApiPropertyOptional({ example: "I would like to schedule a consultation." })
    @IsOptional()
    @IsString()
    message?: string;

    @ApiPropertyOptional({
        type: "string",
        format: "binary",
        description: "Contact lead attachment file",
    })
    @IsOptional()
    @IsString()
    attachments?: string;
}
