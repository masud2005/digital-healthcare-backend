import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import type { Prisma, SubmissionStatus } from "@prisma/client";

const assessmentSubmissionInclude = {
    assessment: {
        select: {
            id: true,
            title: true,
        },
    },
    user: {
        select: {
            id: true,
            email: true,
        },
    },
    answers: {
        orderBy: { createdAt: "asc" },
        include: {
            question: {
                select: {
                    id: true,
                },
            },
            selectedOptions: {
                include: {
                    option: {
                        select: {
                            id: true,
                            label: true,
                        },
                    },
                },
            },
        },
    },
} satisfies Prisma.AssessmentSubmissionInclude;

export type AssessmentSubmissionRecord = Prisma.AssessmentSubmissionGetPayload<{
    include: typeof assessmentSubmissionInclude;
}>;

export type CreateAssessmentSubmissionInput = {
    userId: string;
    assessmentId: string;
    answers: Array<{
        questionId: string;
        textResponse?: string | null;
        selectedOptionIds?: string[];
    }>;
    status?: SubmissionStatus;
};

@Injectable()
export class AssessmentSubmissionRepository {
    constructor(private readonly prisma: PrismaService) {}

    create(data: CreateAssessmentSubmissionInput) {
        return this.prisma.assessmentSubmission.create({
            data: {
                userId: data.userId,
                assessmentId: data.assessmentId,
                status: data.status,
                answers: {
                    create: data.answers.map((answer) => ({
                        questionId: answer.questionId,
                        textResponse: answer.textResponse ?? null,
                        selectedOptions: answer.selectedOptionIds?.length
                            ? {
                                  create: answer.selectedOptionIds.map((optionId) => ({
                                      optionId,
                                  })),
                              }
                            : undefined,
                    })),
                },
            },
            include: assessmentSubmissionInclude,
        });
    }

    findAssessmentById(assessmentId: string) {
        return this.prisma.assessment.findUnique({
            where: { id: assessmentId },
            select: {
                id: true,
                status: true,
            },
        });
    }

    findUserById(userId: string) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
            },
        });
    }

    findQuestionsByIds(assessmentId: string, questionIds: string[]) {
        return this.prisma.question.findMany({
            where: {
                assessmentId,
                id: {
                    in: questionIds,
                },
            },
            select: {
                id: true,
                type: true,
                isRequired: true,
                options: {
                    select: {
                        id: true,
                    },
                },
            },
        });
    }

    createSubmission(data: CreateAssessmentSubmissionInput) {
        return this.create(data);
    }
}
