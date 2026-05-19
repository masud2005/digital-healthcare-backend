import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import type { AssessmentStatus, Prisma } from "@prisma/client";

type AssessmentCreateData = {
    title: string;
    thumbnail?: string | null;
    description: string;
    status?: AssessmentStatus;
    categoryId: string;
};

type AssessmentUpdateData = {
    title?: string;
    thumbnail?: string | null;
    description?: string;
    status?: AssessmentStatus;
    categoryId?: string;
};

type AssessmentFindAllParams = {
    status?: AssessmentStatus;
    categoryId?: string;
    page: number;
    limit: number;
};

@Injectable()
export class AssessmentRepository {
    constructor(private readonly prisma: PrismaService) {}

    create(data: AssessmentCreateData) {
        return this.prisma.assessment.create({
            data,
            include: this.assessmentInclude,
        });
    }

    async findAll(params: AssessmentFindAllParams) {
        const { page, limit, status, categoryId } = params;
        const where: Prisma.AssessmentWhereInput = {
            ...(status ? { status } : {}),
            ...(categoryId ? { categoryId } : {}),
        };

        const [data, total] = await this.prisma.$transaction([
            this.prisma.assessment.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: this.assessmentInclude,
            }),
            this.prisma.assessment.count({ where }),
        ]);

        return { data, total };
    }

    findById(id: string) {
        return this.prisma.assessment.findUnique({
            where: { id },
            include: this.assessmentInclude,
        });
    }

    update(id: string, data: AssessmentUpdateData) {
        return this.prisma.assessment.update({
            where: { id },
            data,
            include: this.assessmentInclude,
        });
    }

    delete(id: string) {
        return this.prisma.assessment.delete({
            where: { id },
        });
    }

    findCategoryById(categoryId: string) {
        return this.prisma.category.findUnique({
            where: { id: categoryId },
            select: { id: true },
        });
    }

    private readonly assessmentInclude = {
        category: {
            select: {
                id: true,
                name: true,
            },
        },
    } satisfies Prisma.AssessmentInclude;
}