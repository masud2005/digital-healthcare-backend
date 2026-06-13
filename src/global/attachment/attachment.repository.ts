import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import type { AttachmentContext } from "@constant/enums";

@Injectable()
export class AttachmentRepository {
    constructor(private readonly prisma: PrismaService) {}

    create(data: {
        fileName: string;
        fileUrl: string;
        fileType: string;
        fileSize: number;
        context: AttachmentContext;
        uploadedById?: string;
    }) {
        return this.prisma.attachment.create({ data });
    }

    createMany(
        records: {
            fileName: string;
            fileUrl: string;
            fileType: string;
            fileSize: number;
            context: AttachmentContext;
            uploadedById?: string;
        }[],
    ) {
        return this.prisma.attachment.createManyAndReturn({ data: records });
    }

async findAll(params: {
        skip?: number;
        take?: number;
        context?: AttachmentContext;
        uploadedById?: string;
    }) {
        const { skip, take, context, uploadedById } = params;
        
        const where = {
            ...(context && { context }),
            ...(uploadedById && { uploadedById }),
        };

        // Run both count and findMany queries in parallel
        const [totalItems, attachments] = await this.prisma.$transaction([
            this.prisma.attachment.count({ where }),
            this.prisma.attachment.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: "desc" },
            }),
        ]);

        return { totalItems, attachments };
    }
    findById(id: string) {
        return this.prisma.attachment.findUnique({ where: { id } });
    }

    update(
        id: string,
        data: {
            fileName?: string;
            fileUrl?: string;
            fileType?: string;
            fileSize?: number;
            context?: AttachmentContext;
        },
    ) {
        return this.prisma.attachment.update({ where: { id }, data });
    }

    delete(id: string) {
        return this.prisma.attachment.delete({ where: { id } });
    }
}

