import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { Prisma, ConsentType, ConsentStatus, ConsentSource } from "@prisma/client";

type ConsentCreateData = {
    userName?: string | null;
    email?: string | null;
    type: ConsentType;
    status?: ConsentStatus;
    source?: ConsentSource;
    userId?: string | null;
};

type ConsentUpdateData = {
    userName?: string | null;
    email?: string | null;
    type?: ConsentType;
    status?: ConsentStatus;
    source?: ConsentSource;
};

type ConsentFindAllParams = {
    search?: string;
    role?: string;
    type?: ConsentType;
    status?: ConsentStatus;
    source?: ConsentSource;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
};

@Injectable()
export class ConsentRepository {
    constructor(private readonly prisma: PrismaService) {}

    create(data: ConsentCreateData) {
        return this.prisma.consent.create({ data });
    }

    async findAll(params: ConsentFindAllParams) {
        const { page, limit, search, role, type, status, source, startDate, endDate } = params;

        let userIds: string[] | undefined = undefined;
        if (role) {
            const userRoles = await this.prisma.userRole.findMany({
                where: {
                    role: {
                        name: {
                            equals: role,
                            mode: "insensitive",
                        },
                    },
                },
                select: { userId: true },
            });
            userIds = userRoles.map((ur) => ur.userId);
        }

        const where: Prisma.ConsentWhereInput = {
            ...(type ? { type } : {}),
            ...(status ? { status } : {}),
            ...(source ? { source } : {}),
            ...(userIds !== undefined ? { userId: { in: userIds } } : {}),
            ...(search
                ? {
                      OR: [
                          { userName: { contains: search, mode: "insensitive" } },
                          { email: { contains: search, mode: "insensitive" } },
                      ],
                  }
                : {}),
            ...(startDate || endDate
                ? {
                      consentDate: {
                          ...(startDate ? { gte: startDate } : {}),
                          ...(endDate ? { lte: endDate } : {}),
                      },
                  }
                : {}),
        };

        if (page !== undefined && limit !== undefined) {
            const [data, total] = await this.prisma.$transaction([
                this.prisma.consent.findMany({
                    where,
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: { consentDate: "desc" },
                }),
                this.prisma.consent.count({ where }),
            ]);
            return { data, total };
        }

        const data = await this.prisma.consent.findMany({
            where,
            orderBy: { consentDate: "desc" },
        });

        return { data, total: data.length };
    }

    findById(id: string) {
        return this.prisma.consent.findUnique({
            where: { id },
        });
    }

    update(id: string, data: ConsentUpdateData) {
        return this.prisma.consent.update({
            where: { id },
            data,
        });
    }

    delete(id: string) {
        return this.prisma.consent.delete({
            where: { id },
        });
    }

    async getStats() {
        const [total, granted, pending, revoked] = await Promise.all([
            this.prisma.consent.count(),
            this.prisma.consent.count({ where: { status: "ACCEPTED" } }),
            this.prisma.consent.count({ where: { status: "PENDING" } }),
            this.prisma.consent.count({ where: { status: "REVOKED" } }),
        ]);

        return { total, granted, pending, revoked };
    }
}
