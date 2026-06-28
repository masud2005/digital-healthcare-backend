import type { AttachmentContext } from "@constant/enums";
import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { DocumentDateFilter } from "./dto/document-query.dto";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

@Injectable()
export class DocumentCenterRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(params: {
        page?: number;
        limit?: number;
        type?: AttachmentContext;
        date?: DocumentDateFilter;
        search?: string;
    }) {
        const page = params.page ?? DEFAULT_PAGE;
        const limit = params.limit ?? DEFAULT_LIMIT;
        const skip = (page - 1) * limit;

        const where = this.buildWhere(params);

        const [data, total] = await this.prisma.$transaction([
            this.prisma.attachment.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    uploadedBy: {
                        select: {
                            patientProfile: { select: { name: true } },
                            doctorProfile: { select: { name: true } },
                            adminProfile: { select: { name: true } },
                        },
                    },
                },
            }),
            this.prisma.attachment.count({ where }),
        ]);

        return { data, total, page, limit };
    }

    async getStats() {
        const grouped = await this.prisma.attachment.groupBy({
            by: ["context"],
            _count: { id: true },
        });

        return grouped.map((g) => ({ type: g.context, count: g._count.id }));
    }

    findById(id: string) {
        return this.prisma.attachment.findUnique({
            where: { id },
            include: {
                uploadedBy: {
                    select: {
                        patientProfile: { select: { name: true } },
                        doctorProfile: { select: { name: true } },
                        adminProfile: { select: { name: true } },
                    },
                },
            },
        });
    }

    private buildWhere(params: {
        type?: AttachmentContext;
        date?: DocumentDateFilter;
        search?: string;
    }) {
        const where: any = {};

        if (params.type) {
            where.context = params.type;
        }

        if (params.date && params.date !== DocumentDateFilter.ALL) {
            const now = new Date();
            const from = new Date();

            if (params.date === DocumentDateFilter.TODAY) {
                from.setHours(0, 0, 0, 0);
            } else if (params.date === DocumentDateFilter.LAST_7_DAYS) {
                from.setDate(now.getDate() - 7);
            } else if (params.date === DocumentDateFilter.LAST_MONTH) {
                from.setMonth(now.getMonth() - 1);
            } else if (params.date === DocumentDateFilter.LAST_YEAR) {
                from.setFullYear(now.getFullYear() - 1);
            }

            where.createdAt = { gte: from };
        }

        if (params.search) {
            where.OR = [
                { fileName: { contains: params.search, mode: "insensitive" } },
                {
                    uploadedBy: {
                        OR: [
                            {
                                patientProfile: {
                                    name: { contains: params.search, mode: "insensitive" },
                                },
                            },
                            {
                                doctorProfile: {
                                    name: { contains: params.search, mode: "insensitive" },
                                },
                            },
                            {
                                adminProfile: {
                                    name: { contains: params.search, mode: "insensitive" },
                                },
                            },
                        ],
                    },
                },
            ];
        }

        return where;
    }
}
