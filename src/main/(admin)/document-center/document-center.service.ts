import { StorageService } from "@global/storage/storage.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { DocumentCenterRepository } from "./document-center.repository";
import { DocumentQueryDto } from "./dto/document-query.dto";

@Injectable()
export class DocumentCenterService {
    constructor(
        private readonly repo: DocumentCenterRepository,
        private readonly storageService: StorageService,
    ) {}

    async getStats() {
        const data = await this.repo.getStats();
        return { data };
    }

    async findAll(query: DocumentQueryDto) {
        const { data, total, page, limit } = await this.repo.findAll(query);

        const items = await Promise.all(
            data.map(async (doc) => ({
                id: doc.id,
                documentName: doc.fileName,
                type: doc.context,
                uploadedBy: this.resolveUploaderName(doc.uploadedBy),
                date: doc.createdAt,
                size: doc.fileSize,
            })),
        );

        return {
            data: items,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }

    async findById(id: string) {
        const doc = await this.repo.findById(id);
        if (!doc) throw new NotFoundException("Document not found");

        return {
            id: doc.id,
            documentName: doc.fileName,
            type: doc.context,
            fileType: doc.fileType,
            size: doc.fileSize,
            fileUrl: await this.storageService.getSignedUrl(doc.fileUrl),
            uploadedBy: this.resolveUploaderName(doc.uploadedBy),
            date: doc.createdAt,
        };
    }

    private resolveUploaderName(
        uploadedBy: {
            patientProfile: { name: string } | null;
            doctorProfile: { name: string } | null;
            adminProfile: { name: string } | null;
        } | null,
    ): string | null {
        if (!uploadedBy) return null;
        return (
            uploadedBy.patientProfile?.name ??
            uploadedBy.doctorProfile?.name ??
            uploadedBy.adminProfile?.name ??
            null
        );
    }
}
