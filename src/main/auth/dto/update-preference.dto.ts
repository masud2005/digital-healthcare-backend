import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";

export class UpdatePreferenceDto {
    @ApiPropertyOptional({ example: true })
    @IsBoolean()
    @IsOptional()
    emailNotifications?: boolean;

    @ApiPropertyOptional({ example: true })
    @IsBoolean()
    @IsOptional()
    smsNotifications?: boolean;

    @ApiPropertyOptional({ example: false })
    @IsBoolean()
    @IsOptional()
    pushNotifications?: boolean;
}
