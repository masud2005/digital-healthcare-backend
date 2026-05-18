import { Injectable } from "@nestjs/common";
import { PrismaService } from "@global/prisma/prisma.service";
import type { CategoryStatus } from "@constant/enums";

type CategoryCreateData = {
    name: string;
    description?: string | null;
    status?: CategoryStatus;
};

type CategoryUpdateData = {
    name?: string;
    description?: string | null;
    status?: CategoryStatus;
};

type CategoryFindAllParams = {
    search?: string;
    status?: CategoryStatus;
    page: number;
    limit: number;
};

@Injectable()
export class CategoryRepository {
    constructor(private readonly prisma: PrismaService) {}

    create(data: CategoryCreateData) {
        return this.prisma.category.create({ data });
    }

    async findAll(params: CategoryFindAllParams) {
        const { page, limit, search, status } = params;
        const where = {
            ...(status ? { status } : {}),
            ...(search
                ? {
                      OR: [
                          { name: { contains: search, mode: "insensitive" as const } },
                          { description: { contains: search, mode: "insensitive" as const } },
                      ],
                  }
                : {}),
        };

        const [data, total] = await this.prisma.$transaction([
            this.prisma.category.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            this.prisma.category.count({ where }),
        ]);

        return { data, total };
    }

    findById(id: string) {
        return this.prisma.category.findUnique({
            where: { id },
        });
    }

    update(id: string, data: CategoryUpdateData) {
        return this.prisma.category.update({
            where: { id },
            data,
        });
    }

    delete(id: string) {
        return this.prisma.category.delete({
            where: { id },
        });
    }
}
