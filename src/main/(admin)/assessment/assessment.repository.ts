import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import type { AssessmentStatus, Prisma } from "@prisma/client";

type AssessmentCreateData = {
    title: string;
    thumbnail?: string | null;
    description: string;
    status?: AssessmentStatus;
    publishedAt?: Date | null;
    categoryId: string;
};

type AssessmentUpdateData = {
    title?: string;
    thumbnail?: string | null;
    description?: string;
    status?: AssessmentStatus;
    publishedAt?: Date | null;
    categoryId?: string;
};

type AssessmentFindAllParams = {
    status?: AssessmentStatus;
    categoryName?: string;
    page: number;
    limit: number;
};

const assessmentInclude = {
    category: {
        select: {
            id: true,
            name: true,
        },
    },
    _count: {
        select: {
            questions: true,
        },
    },
} satisfies Prisma.AssessmentInclude;

const assessmentDetailInclude = {
    category: {
        select: {
            id: true,
            name: true,
        },
    },
    _count: {
        select: {
            questions: true,
        },
    },
    questions: {
        orderBy: { createdAt: "asc" },
        include: {
            options: {
                select: {
                    id: true,
                    label: true,
                    placeholder: true,
                    inputType: true,
                },
            },
            parentOption: {
                select: {
                    id: true,
                    label: true,
                },
            },
        },
    },
} satisfies Prisma.AssessmentInclude;

export type AssessmentRecord = Prisma.AssessmentGetPayload<{
    include: typeof assessmentInclude;
}>;

export type AssessmentDetailRecord = Prisma.AssessmentGetPayload<{
    include: typeof assessmentDetailInclude;
}>;

export type AssessmentStats = {
    activeAssessments: number;
    draftAssessments: number;
    disabledAssessments: number;
    assessmentTaken: number;
    approvedAssessments: number;
    declinedAssessments: number;
};

@Injectable()
export class AssessmentRepository {
    constructor(private readonly prisma: PrismaService) {}

    create(data: AssessmentCreateData) {
        return this.prisma.assessment.create({
            data,
            include: assessmentInclude,
        });
    }

    async findAll(params: AssessmentFindAllParams) {
        const { page, limit, status, categoryName } = params;
        const where: Prisma.AssessmentWhereInput = {
            ...(status ? { status } : {}),
            ...(categoryName ? { category: { name: categoryName } } : {}),
        };

        const [data, total] = await this.prisma.$transaction([
            this.prisma.assessment.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: assessmentInclude,
            }),
            this.prisma.assessment.count({ where }),
        ]);

        return { data, total };
    }

    findById(id: string) {
        return this.prisma.assessment.findUnique({
            where: { id },
            include: assessmentDetailInclude,
        });
    }

    update(id: string, data: AssessmentUpdateData) {
        return this.prisma.assessment.update({
            where: { id },
            data,
            include: assessmentInclude,
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

    async findStats(): Promise<AssessmentStats> {
        const [
            activeAssessments,
            draftAssessments,
            disabledAssessments,
            assessmentTaken,
            approvedAssessments,
            declinedAssessments,
        ] = await this.prisma.$transaction([
            this.prisma.assessment.count({ where: { status: "ACTIVE" } }),
            this.prisma.assessment.count({ where: { status: "DRAFT" } }),
            this.prisma.assessment.count({ where: { status: "DISABLED" } }),
            this.prisma.assessmentSubmission.count(),
            this.prisma.assessmentSubmission.count({ where: { status: "ACCEPTED" } }),
            this.prisma.assessmentSubmission.count({ where: { status: "REJECTED" } }),
        ]);

        return {
            activeAssessments,
            draftAssessments,
            disabledAssessments,
            assessmentTaken,
            approvedAssessments,
            declinedAssessments,
        };
    }
}
