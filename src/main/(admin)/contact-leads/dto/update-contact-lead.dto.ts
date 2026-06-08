import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateContactLeadDto {
    @ApiPropertyOptional({ example: "John Doe" })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    fullName?: string;

    @ApiPropertyOptional({ example: "john@example.com" })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({ example: "+1 555 0100", nullable: true })
    @IsOptional()
    @IsString()
    phone?: string | null;

    @ApiPropertyOptional({ example: "Medical Weight Loss", nullable: true })
    @IsOptional()
    @IsString()
    service?: string | null;

    @ApiPropertyOptional({ example: "Followed up by phone.", nullable: true })
    @IsOptional()
    @IsString()
    message?: string | null;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    read?: boolean;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    responded?: boolean;

    @ApiPropertyOptional({
        type: "string",
        format: "binary",
        nullable: true,
        description: "Contact lead attachment file",
    })
    @IsOptional()
    @IsString()
    attachments?: string | null;
}
