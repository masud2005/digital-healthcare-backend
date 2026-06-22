import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateGoogleAnalyticsDto {
    @ApiPropertyOptional({ example: "UA-XXXXX-Y" })
    @IsOptional()
    @IsString()
    gaMeasurementId?: string;
}
