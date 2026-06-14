import { attachmentContext, type AttachmentContext } from "@constant/enums";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";

export class UploadAttachmentDto {
    @ApiProperty({
        enum: attachmentContext,
        description: "The context/purpose for which the file is being uploaded",
        example: "PRODUCT_IMAGE",
    })
    @IsEnum(attachmentContext)
    @IsNotEmpty()
    context!: AttachmentContext;
}
