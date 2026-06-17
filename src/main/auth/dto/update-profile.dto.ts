import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateProfileDto {
    @ApiPropertyOptional({ example: "+1 234 567890" })
    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @ApiPropertyOptional({ example: "4140 Parker Rd. Allentown" })
    @IsOptional()
    @IsString()
    addressLine1?: string;

    @ApiPropertyOptional({ example: "Suite 10" })
    @IsOptional()
    @IsString()
    addressLine2?: string;

    @ApiPropertyOptional({ example: "Allentown" })
    @IsOptional()
    @IsString()
    city?: string;

    @ApiPropertyOptional({ example: "NM" })
    @IsOptional()
    @IsString()
    state?: string;

    @ApiPropertyOptional({ example: "31134" })
    @IsOptional()
    @IsString()
    zip?: string;
}
