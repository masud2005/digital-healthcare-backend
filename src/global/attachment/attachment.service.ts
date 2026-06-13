import type { AttachmentContext } from "@constant/enums";
import { StorageService } from "@global/storage/storage.service";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { AttachmentRepository } from "./attachment.repository";
import type { ReplaceAttachmentDto } from "./dto/replace-attachment.dto";
import type { UploadAttachmentDto } from "./dto/upload-attachment.dto";

@Injectable()
export class AttachmentService {
    constructor(
        private readonly attachmentRepository: AttachmentRepository,
        private readonly storageService: StorageService,
    ) {}

    async upload(files: Express.Multer.File[], dto: UploadAttachmentDto, uploadedById?: string) {
        if (!files || files.length === 0) {
            throw new BadRequestException("At least one file is required");
        }

        const context = dto.context as AttachmentContext;

        // 1. Handle Single File Upload Flow
        if (files.length === 1) {
            const { key } = await this.storageService.uploadFile(files[0]);
            const attachment = await this.attachmentRepository.create({
                fileName: files[0].originalname,
                fileUrl: key, // Store S3 Object Key in DB
                fileType: files[0].mimetype,
                fileSize: files[0].size,
                context,
                uploadedById,
            });
            
            const resolvedAttachment = await this.resolveUrl(attachment);
            return {
                success: true,
                message: "File uploaded successfully",
                data: resolvedAttachment,
            };
        }

        // 2. Handle Multiple Files Upload Flow (Parallel uploads via Promise.all)
        const uploaded = await Promise.all(files.map((f) => this.storageService.uploadFile(f)));

        const records = files.map((f, i) => ({
            fileName: f.originalname,
            fileUrl: uploaded[i].key,
            fileType: f.mimetype,
            fileSize: f.size,
            context,
            uploadedById,
        }));

        const attachments = await this.attachmentRepository.createMany(records);
        const resolvedAttachments = await Promise.all(attachments.map((a) => this.resolveUrl(a)));

        return {
            success: true,
            message: "Files uploaded successfully",
            data: resolvedAttachments,
        };
    }

async findAll(query: { page?: number; limit?: number; context?: AttachmentContext }, uploadedById?: string) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;

        // Destructure totalItems and attachments from repository
        const { totalItems, attachments } = await this.attachmentRepository.findAll({
            skip,
            take: limit,
            context: query.context,
            uploadedById,
        });
        // console.log("Attachments", attachments);

        // Resolve signed URLs for all fetched records
        const resolvedAttachments = await Promise.all(attachments.map((a) => this.resolveUrl(a)));
        // console.log("Resolved Attachments", resolvedAttachments);

        const totalPages = Math.ceil(totalItems / limit);

        return {
            success: true,
            message: "Attachments fetched successfully",
            data: resolvedAttachments,
            meta: {
                totalItems,
                totalPages,
                currentPage: page,
                limit,
            },
        };
    }

    async findOne(id: string) {
        const attachment = await this.attachmentRepository.findById(id);
        if (!attachment) throw new NotFoundException("Attachment not found");
        
        const resolvedAttachment = await this.resolveUrl(attachment);

        return {
            success: true,
            message: "Attachment fetched successfully",
            data: resolvedAttachment,
        };
    }

    async replace(id: string, dto: ReplaceAttachmentDto, file?: Express.Multer.File) {
        // Ensure attachment exists before updating
        const existing = await this.attachmentRepository.findById(id);
        if (!existing) throw new NotFoundException("Attachment not found");

        const data: Parameters<AttachmentRepository["update"]>[1] = {};

        // If a new physical file is provided, upload it and update metadata
        if (file) {
            const { key } = await this.storageService.uploadFile(file);
            data.fileName = file.originalname;
            data.fileUrl = key;
            data.fileType = file.mimetype;
            data.fileSize = file.size;

            // Optional: Delete old file from S3 to avoid garbage data
            if (existing.fileUrl) {
                await this.storageService.deleteFile(existing.fileUrl);
            }
        }

        // If only the context needs updating
        if (dto.context) {
            data.context = dto.context as AttachmentContext;
        }

        if (Object.keys(data).length === 0) {
            throw new BadRequestException("Provide a file or context to update");
        }

        const attachment = await this.attachmentRepository.update(id, data);
        const resolvedAttachment = await this.resolveUrl(attachment);

        return {
            success: true,
            message: "Attachment updated successfully",
            data: resolvedAttachment,
        };
    }

    async remove(id: string) {
        // Check if the attachment exists in database
        const attachment = await this.attachmentRepository.findById(id);
        if (!attachment) {
            throw new NotFoundException("Attachment not found");
        }

        // 1. Delete the physical file from S3 storage using stored key
        if (attachment.fileUrl) {
            await this.storageService.deleteFile(attachment.fileUrl);
        }

        // 2. Delete the record from database
        await this.attachmentRepository.delete(id);

        return { 
            success: true, 
            message: "Attachment deleted successfully" 
        };
    }


    //  Resolves the stored S3 storage key into a accessible dynamic signed URL

    private async resolveUrl<T extends { fileUrl: string }>(attachment: T) {
        return {
            ...attachment,
            fileUrl: await this.storageService.getSignedUrl(attachment.fileUrl),
        };
    }
}