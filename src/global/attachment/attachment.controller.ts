import { CurrentUser } from "@common/decorators/current-user.decorator";
import { attachmentContext } from "@constant/enums";
import type { AuthenticatedUser } from "@main/auth/auth.types";
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UploadedFile,
    UploadedFiles,
    UseInterceptors
} from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import {
    ApiBody,
    ApiConsumes,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags
} from "@nestjs/swagger";
import "multer";
import { AttachmentService } from "./attachment.service";
import {
    AttachmentResponseDto,
    PaginatedAttachmentResponseDto,
} from "./dto/attachment-response.dto";
import { GetAttachmentsQueryDto } from "./dto/get-attachments-query.dto";
import { ReplaceAttachmentDto } from "./dto/replace-attachment.dto";
import { UploadAttachmentDto } from "./dto/upload-attachment.dto";

@ApiTags("Attachments")
@Controller("attachments")
export class AttachmentController {
    constructor(private readonly attachmentService: AttachmentService) {}

    @Post("upload")
    @ApiOperation({ summary: "Upload single or multiple files with context" })
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        schema: {
            type: "object",
            required: ["context", "files"],
            properties: {
                context: {
                    type: "string",
                    enum: Object.values(attachmentContext),
                    description: "The context/purpose for which the file is being uploaded",
                    example: "PRODUCT_IMAGE",
                },
                files: {
                    type: "array",
                    items: { type: "string", format: "binary" },
                    description: "Supports single or multiple files under the same field key",
                },
            },
        },
    })
    @ApiCreatedResponse({ type: [AttachmentResponseDto] })
    @UseInterceptors(FilesInterceptor("files", 10)) // Max 10 files allowed at once
    upload(
        @UploadedFiles() files: Express.Multer.File[],
        @Body() dto: UploadAttachmentDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.attachmentService.upload(files, dto, user.id);
    }

    @Get()
    @ApiOperation({ summary: "Get all attachments with pagination and context filter" })
    @ApiOkResponse({ type: PaginatedAttachmentResponseDto })
    findAll(@Query() query: GetAttachmentsQueryDto, @CurrentUser() user: AuthenticatedUser) {
        return this.attachmentService.findAll(query, user.id);
    }

    @Get(":id")
    @ApiOperation({ summary: "Get attachment by id" })
    @ApiOkResponse({ type: AttachmentResponseDto })
    findOne(@Param("id") id: string) {
        return this.attachmentService.findOne(id);
    }

    @Patch(":id")
    @ApiOperation({ summary: "Replace file or update context of an attachment" })
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                context: { type: "string", example: "PROFILE_PICTURE" },
                file: { type: "string", format: "binary" },
            },
        },
    })
    @ApiOkResponse({ type: AttachmentResponseDto })
    @UseInterceptors(FileInterceptor("file"))
    replace(
        @Param("id") id: string,
        @Body() dto: ReplaceAttachmentDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        return this.attachmentService.replace(id, dto, file);
    }

    @Delete(":id")
    @ApiOperation({ summary: "Delete attachment from database and S3 storage" })
    @ApiOkResponse({ description: "Returns success status after deletion" })
    remove(@Param("id") id: string) {
        return this.attachmentService.remove(id);
    }
}
