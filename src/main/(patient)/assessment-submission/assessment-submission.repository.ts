import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import type { Prisma, SubmissionStatus } from "@prisma/client";

const SUBMISSION_CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const SUBMISSION_CODE_LENGTH = 6;
const SUBMISSION_CODE_MAX_RETRIES = 5;

function generateSubmissionCode(): string {
    return Array.from({ length: SUBMISSION_CODE_LENGTH })
        .map(() => SUBMISSION_CODE_CHARS[Math.floor(Math.random() * SUBMISSION_CODE_CHARS.length)])
        .join("");
}

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

const blueprintSubmissionInclude = {
    assessment: {
        include: {
            category: {
                select: { name: true },
            },
            questions: {
                orderBy: { createdAt: "asc" },
                include: {
                    options: {
                        select: {
                            id: true,
                            label: true,
                            inputType: true,
                        },
                    },
                },
            },
        },
    },
    answers: {
        include: {
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

export type BlueprintSubmissionRecord = Prisma.AssessmentSubmissionGetPayload<{
    include: typeof blueprintSubmissionInclude;
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

    async create(data: CreateAssessmentSubmissionInput) {
        for (let attempt = 0; attempt < SUBMISSION_CODE_MAX_RETRIES; attempt++) {
            const submissionCode = generateSubmissionCode();

            try {
                return await this.prisma.assessmentSubmission.create({
                    data: {
                        submissionCode,
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
            } catch (error: any) {
                const isUniqueViolation =
                    error?.code === "P2002" && error?.meta?.target?.includes("submissionCode");

                if (!isUniqueViolation || attempt === SUBMISSION_CODE_MAX_RETRIES - 1) {
                    throw error;
                }
            }
        }

        throw new Error("Failed to generate a unique submission code");
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
                parentOptionId: true,
                options: {
                    select: {
                        id: true,
                    },
                },
            },
        });
    }

    findQuestionsByAssessment(assessmentId: string) {
        return this.prisma.question.findMany({
            where: { assessmentId },
            select: {
                id: true,
                type: true,
                isRequired: true,
                parentOptionId: true,
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

    findMySubmissions(userId: string): Promise<BlueprintSubmissionRecord[]> {
        return this.prisma.assessmentSubmission.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            include: blueprintSubmissionInclude,
        });
    }

    findSubmissionById(id: string, userId: string): Promise<BlueprintSubmissionRecord | null> {
        return this.prisma.assessmentSubmission.findFirst({
            where: { id, userId },
            include: blueprintSubmissionInclude,
        });
    }

    async updateSubmission(
        id: string,
        answers: Array<{
            questionId: string;
            textResponse?: string | null;
            selectedOptionIds?: string[];
        }>,
    ) {
        return this.prisma.$transaction(async (tx) => {
            for (const answer of answers) {
                const existing = await tx.submissionAnswer.findFirst({
                    where: { submissionId: id, questionId: answer.questionId },
                    select: { id: true },
                });

                if (existing) {
                    await tx.selectedOption.deleteMany({
                        where: { submissionAnswerId: existing.id },
                    });
                    await tx.submissionAnswer.update({
                        where: { id: existing.id },
                        data: {
                            textResponse: answer.textResponse ?? null,
                            selectedOptions: answer.selectedOptionIds?.length
                                ? { create: answer.selectedOptionIds.map((optionId) => ({ optionId })) }
                                : undefined,
                        },
                    });
                } else {
                    await tx.submissionAnswer.create({
                        data: {
                            submissionId: id,
                            questionId: answer.questionId,
                            textResponse: answer.textResponse ?? null,
                            selectedOptions: answer.selectedOptionIds?.length
                                ? { create: answer.selectedOptionIds.map((optionId) => ({ optionId })) }
                                : undefined,
                        },
                    });
                }
            }

            return tx.assessmentSubmission.findUniqueOrThrow({
                where: { id },
                include: blueprintSubmissionInclude,
            });
        });
    }
}
