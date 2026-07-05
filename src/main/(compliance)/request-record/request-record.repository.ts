import type { RequestRecordType, RequestRecordStatus } from "@constant/enums";
import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

export type RequestRecordCreateData = {
    firstName: string;
    lastName: string;
    email: string;
    dob: Date;
    requestType: RequestRecordType;
    additionalNotes?: string | null;
    consent: boolean;
    status?: RequestRecordStatus;
    createdAt?: Date;
};

export type RequestRecordUpdateData = Partial<RequestRecordCreateData>;

export type RequestRecordFindAllParams = {
    search?: string;
    requestType?: RequestRecordType;
    status?: RequestRecordStatus;
    from?: Date;
    to?: Date;
    page: number;
    limit: number;
};

@Injectable()
export class RequestRecordRepository {
    constructor(private readonly prisma: PrismaService) {}

    count(where?: Prisma.RequestRecordWhereInput) {
        return this.prisma.requestRecord.count({ where });
    }

    async create(data: RequestRecordCreateData) {
        return this.prisma.requestRecord.create({
            data,
        });
    }

    async findAll(params: RequestRecordFindAllParams) {
        const { page, limit } = params;
        const where = this.buildWhere(params);

        const [data, total] = await this.prisma.$transaction([
            this.prisma.requestRecord.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            this.prisma.requestRecord.count({ where }),
        ]);

        return { data, total };
    }

    findById(id: string) {
        return this.prisma.requestRecord.findUnique({
            where: { id },
        });
    }

    async update(id: string, data: RequestRecordUpdateData) {
        return this.prisma.requestRecord.update({
            where: { id },
            data,
        });
    }

    delete(id: string) {
        return this.prisma.requestRecord.delete({
            where: { id },
        });
    }

    async getOverview() {
        const [total, pending, reviewed, completed] = await this.prisma.$transaction([
            this.prisma.requestRecord.count(),
            this.prisma.requestRecord.count({ where: { status: "PENDING" } }),
            this.prisma.requestRecord.count({ where: { status: "REVIEWED" } }),
            this.prisma.requestRecord.count({ where: { status: "COMPLETED" } }),
        ]);

        return {
            total,
            pending,
            reviewed,
            completed,
        };
    }

    private buildWhere(params: RequestRecordFindAllParams): Prisma.RequestRecordWhereInput {
        const createdAtFilter = this.buildDateRangeFilter(params.from, params.to);

        return {
            ...(params.requestType ? { requestType: params.requestType } : {}),
            ...(params.status ? { status: params.status } : {}),
            ...(createdAtFilter ? { createdAt: createdAtFilter } : {}),
            ...(params.search
                ? {
                      OR: [
                          { firstName: { contains: params.search, mode: "insensitive" } },
                          { lastName: { contains: params.search, mode: "insensitive" } },
                          { email: { contains: params.search, mode: "insensitive" } },
                          { additionalNotes: { contains: params.search, mode: "insensitive" } },
                      ],
                  }
                : {}),
        };
    }

    private buildDateRangeFilter(from?: Date, to?: Date): Prisma.DateTimeFilter | undefined {
        if (!from && !to) {
            return undefined;
        }

        return {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
        };
    }
}
