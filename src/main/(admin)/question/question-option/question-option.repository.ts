import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

type QuestionOptionCreateData = {
    label: string;
    placeholder?: string | null;
    inputType?: string | null;
    questionId: string;
};

type QuestionOptionUpdateData = Partial<QuestionOptionCreateData>;

type QuestionOptionFindAllParams = {
    questionId?: string;
    page: number;
    limit: number;
};

@Injectable()
export class QuestionOptionRepository {
    constructor(private readonly prisma: PrismaService) {}

    create(data: QuestionOptionCreateData) {
        return this.prisma.questionOption.create({ data });
    }

    async findAll(params: QuestionOptionFindAllParams) {
        const { page, limit, questionId } = params;
        const where: Prisma.QuestionOptionWhereInput = {
            ...(questionId ? { questionId } : {}),
        };

        const [data, total] = await this.prisma.$transaction([
            this.prisma.questionOption.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" } }),
            this.prisma.questionOption.count({ where }),
        ]);

        return { data, total };
    }

    findById(id: string) {
        return this.prisma.questionOption.findUnique({ where: { id } });
    }

    update(id: string, data: QuestionOptionUpdateData) {
        return this.prisma.questionOption.update({ where: { id }, data });
    }

    delete(id: string) {
        return this.prisma.questionOption.delete({ where: { id } });
    }

    findQuestionById(questionId: string) {
        return this.prisma.question.findUnique({ where: { id: questionId }, select: { id: true } });
    }
}
