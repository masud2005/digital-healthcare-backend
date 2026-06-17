import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

type ContactLeadCreateData = {
    fullName: string;
    email: string;
    phone?: string | null;
    service?: string | null;
    message?: string | null;
    attachmentId?: string | null;
};

type ContactLeadUpdateData = {
    fullName?: string;
    email?: string;
    phone?: string | null;
    service?: string | null;
    message?: string | null;
    read?: boolean;
    responded?: boolean;
    attachmentId?: string | null;
    responseSubject?: string | null;
    responseMessage?: string | null;
    responseAttachmentId?: string | null;
    respondedAt?: Date | null;
};

type ContactLeadFindAllParams = {
    search?: string;
    service?: string;
    read?: boolean;
    responded?: boolean;
    page: number;
    limit: number;
};

const leadInclude = {
    attachment: true,
    responseAttachment: true,
} as const;

@Injectable()
export class ContactLeadsRepository {
    constructor(private readonly prisma: PrismaService) {}

    create(data: ContactLeadCreateData) {
        return this.prisma.contactLead.create({
            data,
            include: leadInclude,
        });
    }

    async findAll(params: ContactLeadFindAllParams) {
        const { page, limit, search, service, read, responded } = params;
        const where: Prisma.ContactLeadWhereInput = {
            ...(read !== undefined ? { read } : {}),
            ...(responded !== undefined ? { responded } : {}),
            ...(service ? { service: { contains: service, mode: "insensitive" } } : {}),
            ...(search
                ? {
                      OR: [
                          { fullName: { contains: search, mode: "insensitive" } },
                          { email: { contains: search, mode: "insensitive" } },
                          { phone: { contains: search, mode: "insensitive" } },
                          { service: { contains: search, mode: "insensitive" } },
                          { message: { contains: search, mode: "insensitive" } },
                      ],
                  }
                : {}),
        };

        const [data, total] = await this.prisma.$transaction([
            this.prisma.contactLead.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: leadInclude,
            }),
            this.prisma.contactLead.count({ where }),
        ]);

        return { data, total };
    }

    findMany(params: Omit<ContactLeadFindAllParams, "page" | "limit">) {
        const { search, service, read, responded } = params;
        const where: Prisma.ContactLeadWhereInput = {
            ...(read !== undefined ? { read } : {}),
            ...(responded !== undefined ? { responded } : {}),
            ...(service ? { service: { contains: service, mode: "insensitive" } } : {}),
            ...(search
                ? {
                      OR: [
                          { fullName: { contains: search, mode: "insensitive" } },
                          { email: { contains: search, mode: "insensitive" } },
                          { phone: { contains: search, mode: "insensitive" } },
                          { service: { contains: search, mode: "insensitive" } },
                          { message: { contains: search, mode: "insensitive" } },
                      ],
                  }
                : {}),
        };

        return this.prisma.contactLead.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: leadInclude,
        });
    }

    findById(id: string) {
        return this.prisma.contactLead.findUnique({
            where: { id },
            include: leadInclude,
        });
    }

    update(id: string, data: ContactLeadUpdateData) {
        return this.prisma.contactLead.update({
            where: { id },
            data,
            include: leadInclude,
        });
    }

    delete(id: string) {
        return this.prisma.contactLead.delete({
            where: { id },
        });
    }
}
