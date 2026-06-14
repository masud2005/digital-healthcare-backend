import type { Alignment, QuestionType } from "@constant/enums";
import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

type QuestionCreateData = {
    type: QuestionType;
    heading?: string | null;
    media?: string | null;
    questionText?: string | null;
    description?: string | null;
    contentAlignment?: Alignment;
    isRequired?: boolean;
    assessmentId: string;
    parentOptionId?: string | null;
};

type QuestionUpdateData = Partial<QuestionCreateData>;

type QuestionFindAllParams = {
    assessmentId?: string;
    page: number;
    limit: number;
};

@Injectable()
export class QuestionRepository {
    constructor(private readonly prisma: PrismaService) {}

    create(data: QuestionCreateData) {
        return this.prisma.question.create({ data, include: this.questionInclude });
    }

    async findAll(params: QuestionFindAllParams) {
        const { page, limit, assessmentId } = params;
        const where: Prisma.QuestionWhereInput = {
            ...(assessmentId ? { assessmentId } : {}),
        };

        const [data, total] = await this.prisma.$transaction([
            this.prisma.question.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: this.questionInclude,
            }),
            this.prisma.question.count({ where }),
        ]);

        return { data, total };
    }

    findById(id: string) {
        return this.prisma.question.findUnique({ where: { id }, include: this.questionInclude });
    }

    update(id: string, data: QuestionUpdateData) {
        return this.prisma.question.update({ where: { id }, data, include: this.questionInclude });
    }

    delete(id: string) {
        return this.prisma.question.delete({ where: { id } });
    }

    findAssessmentById(assessmentId: string) {
        return this.prisma.assessment.findUnique({
            where: { id: assessmentId },
            select: { id: true },
        });
    }

    private readonly questionInclude = {
        options: {
            select: {
                id: true,
                label: true,
                placeholder: true,
                inputType: true,
            },
        },
        parentOption: {
            select: { id: true, label: true },
        },
    } satisfies Prisma.QuestionInclude;
}
