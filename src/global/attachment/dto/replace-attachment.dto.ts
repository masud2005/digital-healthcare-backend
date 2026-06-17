import { attachmentContext, type AttachmentContext } from "@constant/enums";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";

export class ReplaceAttachmentDto {
    @ApiPropertyOptional({
        enum: attachmentContext,
        description: "Optional context update for the attachment",
        example: "PROFILE_PICTURE",
    })
    @IsOptional()
    @IsEnum(attachmentContext)
    context?: AttachmentContext;
}
