import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class ToggleRecurringDto {
    @ApiProperty({
        example: true,
        description:
            "Set to true to enable auto-renewal (recurring billing). " +
            "Set to false to disable auto-renewal — subscription stays active until period ends but won't auto-renew.",
    })
    @IsBoolean()
    isRecurring: boolean;
}
