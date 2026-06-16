import { StorageService } from "@global/storage/storage.service";
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "@global/prisma/prisma.service";
import type { QuestionType } from "@prisma/client";
import {
    AssessmentSubmissionRecord,
    AssessmentSubmissionRepository,
    BlueprintSubmissionRecord,
} from "./assessment-submission.repository";
import { CreateAssessmentSubmissionDto } from "./dto/create-assessment-submission.dto";
import { UpdateAssessmentSubmissionDto } from "./dto/update-assessment-submission.dto";

type NormalizedAnswer = {
    questionId: string;
    textResponse?: string | null;
    selectedOptionIds: string[];
};

type SubmissionQuestion = {
    id: string;
    type: QuestionType;
    isRequired: boolean;
    parentOptionId: string | null;
    options: Array<{ id: string }>;
};

const EDITABLE_STATUSES: string[] = ["DRAFT", "REFIL_REQUESTED"];

@Injectable()
export class AssessmentSubmissionService {
    constructor(
        private readonly assessmentSubmissionRepository: AssessmentSubmissionRepository,
        private readonly storageService: StorageService,
        private readonly prisma: PrismaService,
    ) {}

    async getMyAssessmentBlueprints(userId: string) {
        const submissions = await this.assessmentSubmissionRepository.findMySubmissions(userId);
        return Promise.all(submissions.map((s) => this.mapBlueprint(s)));
    }

    async getMyAssessmentBlueprint(submissionId: string, userId: string) {
        const submission = await this.assessmentSubmissionRepository.findSubmissionById(
            submissionId,
            userId,
        );

        if (!submission) {
            throw new NotFoundException("Submission not found");
        }

        return this.mapBlueprint(submission);
    }

    async updateSubmission(
        submissionId: string,
        userId: string,
        payload: UpdateAssessmentSubmissionDto,
    ) {
        const submission = await this.assessmentSubmissionRepository.findSubmissionById(
            submissionId,
            userId,
        );

        if (!submission) {
            throw new NotFoundException("Submission not found");
        }

        if (!EDITABLE_STATUSES.includes(submission.status)) {
            throw new ForbiddenException("Only DRAFT submissions can be edited");
        }

        const normalizedAnswers = this.normalizeAnswers(payload.answers);
        const questionIds = normalizedAnswers.map((a) => a.questionId);
        const questions = await this.assessmentSubmissionRepository.findQuestionsByAssessment(
            submission.assessmentId,
        );
        const submittedQuestions = questions.filter((q) => questionIds.includes(q.id));

        if (submittedQuestions.length !== questionIds.length) {
            throw new BadRequestException("One or more questions are invalid for this assessment");
        }

        const questionMap = new Map(questions.map((q) => [q.id, q]));
        this.validateAnswers(normalizedAnswers, submittedQuestions, questionMap);

        const updated = await this.assessmentSubmissionRepository.updateSubmission(
            submissionId,
            normalizedAnswers,
        );
        return this.mapBlueprint(updated);
    }

    async create(userId: string, payload: CreateAssessmentSubmissionDto) {
        const assessment = await this.assessmentSubmissionRepository.findAssessmentById(
            payload.assessmentId,
        );

        if (!assessment) {
            throw new NotFoundException("Assessment not found");
        }

        if (assessment.status !== "ACTIVE") {
            throw new BadRequestException("Assessment is not active");
        }

        const user = await this.assessmentSubmissionRepository.findUserById(userId);

        if (!user) {
            throw new NotFoundException("User not found");
        }

        const normalizedAnswers = this.normalizeAnswers(payload.answers);
        const questionIds = normalizedAnswers.map((answer) => answer.questionId);
        const questions = await this.assessmentSubmissionRepository.findQuestionsByAssessment(
            payload.assessmentId,
        );
        const submittedQuestions = questions.filter((question) =>
            questionIds.includes(question.id),
        );

        if (submittedQuestions.length !== questionIds.length) {
            throw new BadRequestException("One or more questions are invalid for this assessment");
        }

        const questionMap = new Map(questions.map((question) => [question.id, question]));
        this.validateAnswers(normalizedAnswers, questions, questionMap);

        const submission = await this.assessmentSubmissionRepository.createSubmission({
            userId,
            assessmentId: payload.assessmentId,
            answers: normalizedAnswers,
        });

        return this.mapSubmission(submission);
    }

    private async mapBlueprint(submission: BlueprintSubmissionRecord) {
        const { assessment } = submission;

        // Build answer map: questionId → answer
        const answerMap = new Map(
            submission.answers.map((a) => [
                a.questionId,
                {
                    textResponse: a.textResponse,
                    selectedOptions: a.selectedOptions.map((s) => ({
                        id: s.option.id,
                        label: s.option.label,
                    })),
                },
            ]),
        );

        const thumbnail = await this.storageService.resolveKey(assessment.thumbnail);

        // Build a map of all question options keyed by questionId for file-type detection
        const questionOptionsMap = new Map(
            assessment.questions.map((q) => [q.id, q.options]),
        );

        const questionsByParentOptionId = new Map<string, typeof assessment.questions>();
        for (const q of assessment.questions) {
            if (!q.parentOptionId) continue;
            const group = questionsByParentOptionId.get(q.parentOptionId) ?? [];
            group.push(q);
            questionsByParentOptionId.set(q.parentOptionId, group);
        }

        const buildPatientAnswer = async (questionId: string) => {
            const answer = answerMap.get(questionId);
            if (!answer) return null;

            const options = questionOptionsMap.get(questionId) ?? [];
            const isFileInput = options.some(
                (o) => o.inputType?.toLowerCase() === "file",
            );

            // Resolve attachment if textResponse holds a file attachment id
            let resolvedFile: { id: string; fileUrl: string | null } | null = null;
            if (isFileInput && answer.textResponse) {
                const attachment = await this.prisma.attachment.findUnique({
                    where: { id: answer.textResponse },
                    select: { id: true, fileUrl: true, fileName: true, fileType: true },
                });

                if (attachment) {
                    resolvedFile = {
                        ...attachment,
                        fileUrl: await this.storageService.resolveKey(attachment.fileUrl),
                    };
                }
            }

            return {
                selectedOptions: answer.selectedOptions,
                textResponse: isFileInput ? null : (answer.textResponse ?? null),
                file: resolvedFile,
            };
        };

        const buildQuestion = async (q: (typeof assessment.questions)[number]): Promise<object> => ({
            id: q.id,
            type: q.type,
            heading: q.heading ?? null,
            questionText: q.questionText ?? null,
            description: q.description ?? null,
            options: await Promise.all(
                q.options.map(async (opt) => ({
                    id: opt.id,
                    label: opt.label,
                    inputType: opt.inputType ?? null,
                    subQuestions: await Promise.all(
                        (questionsByParentOptionId.get(opt.id) ?? []).map((child) =>
                            buildQuestion(child),
                        ),
                    ),
                })),
            ),
            patientAnswer: await buildPatientAnswer(q.id),
        });

        const rootQuestions = await Promise.all(
            assessment.questions
                .filter((q) => !q.parentOptionId)
                .map((q) => buildQuestion(q)),
        );

        return {
            submissionId: submission.id,
            submissionCode: submission.submissionCode,
            status: submission.status,
            isEditable: EDITABLE_STATUSES.includes(submission.status),
            assessment: {
                id: assessment.id,
                title: assessment.title,
                thumbnail,
                category: assessment.category.name,
            },
            questions: rootQuestions,
        };
    }

    private validateAnswers(
        answers: NormalizedAnswer[],
        questions: SubmissionQuestion[],
        questionMap: Map<string, SubmissionQuestion>,
    ) {
        const answerMap = new Map(answers.map((answer) => [answer.questionId, answer]));
        const selectedOptionIds = new Set(answers.flatMap((answer) => answer.selectedOptionIds));

        for (const answer of answers) {
            const question = questionMap.get(answer.questionId);

            if (!question) {
                throw new BadRequestException(
                    "One or more questions are invalid for this assessment",
                );
            }

            this.validateQuestionApplicability(question, selectedOptionIds);
            this.validateAnswerByQuestionType(answer, question);
        }

        for (const question of questions) {
            if (!this.requiresAnswer(question, selectedOptionIds)) {
                continue;
            }

            const answer = answerMap.get(question.id);

            if (!answer || !this.hasAnswerValue(answer)) {
                throw new BadRequestException("All required questions must be answered");
            }
        }
    }

    private validateQuestionApplicability(
        question: SubmissionQuestion,
        selectedOptionIds: Set<string>,
    ) {
        if (question.parentOptionId && !selectedOptionIds.has(question.parentOptionId)) {
            throw new BadRequestException(
                "Sub-question answers are allowed only when their parent option is selected",
            );
        }
    }

    private validateAnswerByQuestionType(answer: NormalizedAnswer, question: SubmissionQuestion) {
        if (question.type === "INFORMATION_ONLY") {
            throw new BadRequestException("Information-only questions do not accept answers");
        }

        if (question.type === "INPUT") {
            if (answer.selectedOptionIds.length > 0) {
                throw new BadRequestException("Input questions accept textResponse only");
            }

            if (!answer.textResponse) {
                throw new BadRequestException("Input questions require textResponse");
            }

            return;
        }

        if (answer.textResponse) {
            throw new BadRequestException("Choice questions accept selectedOptionIds only");
        }

        if (question.type === "SINGLE_CHOICE" && answer.selectedOptionIds.length !== 1) {
            throw new BadRequestException(
                "Single choice questions require exactly one selected option",
            );
        }

        if (question.type === "MULTIPLE_CHOICE" && answer.selectedOptionIds.length === 0) {
            throw new BadRequestException(
                "Multiple choice questions require at least one selected option",
            );
        }

        if (question.type === "SINGLE_CHOICE" || question.type === "MULTIPLE_CHOICE") {
            const allowedOptionIds = new Set(question.options.map((option) => option.id));

            for (const selectedOptionId of answer.selectedOptionIds) {
                if (!allowedOptionIds.has(selectedOptionId)) {
                    throw new BadRequestException(
                        "One or more selected options are invalid for the question",
                    );
                }
            }
        }
    }

    private requiresAnswer(question: SubmissionQuestion, selectedOptionIds: Set<string>) {
        return (
            question.isRequired &&
            question.type !== "INFORMATION_ONLY" &&
            (!question.parentOptionId || selectedOptionIds.has(question.parentOptionId))
        );
    }

    private hasAnswerValue(answer: NormalizedAnswer) {
        return Boolean(answer.textResponse) || answer.selectedOptionIds.length > 0;
    }

    private normalizeAnswers(
        answers: CreateAssessmentSubmissionDto["answers"],
    ): NormalizedAnswer[] {
        const seenQuestionIds = new Set<string>();

        return answers.map((answer) => {
            const questionId = answer.questionId.trim();

            if (seenQuestionIds.has(questionId)) {
                throw new BadRequestException("Duplicate question answers are not allowed");
            }

            seenQuestionIds.add(questionId);

            return {
                questionId,
                textResponse: answer.textResponse?.trim() || null,
                selectedOptionIds: Array.from(new Set(answer.selectedOptionIds ?? [])),
            };
        });
    }

    private mapSubmission(submission: AssessmentSubmissionRecord) {
        return {
            ...submission,
            answers: submission.answers.map((answer) => ({
                ...answer,
                selectedOptions: answer.selectedOptions.map((selectedOption) => ({
                    id: selectedOption.id,
                    optionId: selectedOption.option.id,
                    optionLabel: selectedOption.option.label,
                })),
            })),
        };
    }
}
