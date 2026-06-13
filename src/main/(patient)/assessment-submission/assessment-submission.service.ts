import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { AuditLogService } from "../../(compliance)/audit-log/audit-log.service";
import {
    AssessmentSubmissionRecord,
    AssessmentSubmissionRepository,
} from "./assessment-submission.repository";
import { CreateAssessmentSubmissionDto } from "./dto/create-assessment-submission.dto";

@Injectable()
export class AssessmentSubmissionService {
    constructor(
        private readonly assessmentSubmissionRepository: AssessmentSubmissionRepository,
        private readonly auditLogService: AuditLogService,
    ) {}

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
        const questions = await this.assessmentSubmissionRepository.findQuestionsByIds(
            payload.assessmentId,
            questionIds,
        );

        if (questions.length !== questionIds.length) {
            throw new BadRequestException(
                "One or more questions are invalid for this assessment",
            );
        }

        const questionMap = new Map(questions.map((question) => [question.id, question]));

        for (const answer of normalizedAnswers) {
            const question = questionMap.get(answer.questionId);

            if (!question) {
                throw new BadRequestException(
                    "One or more questions are invalid for this assessment",
                );
            }

            if (
                question.isRequired &&
                !answer.textResponse &&
                answer.selectedOptionIds.length === 0
            ) {
                throw new BadRequestException("All required questions must be answered");
            }

            if (question.type === "SINGLE_CHOICE" && answer.selectedOptionIds.length > 1) {
                throw new BadRequestException(
                    "Single choice questions accept only one option",
                );
            }

            const allowedOptionIds = new Set(question.options.map((option) => option.id));
            for (const selectedOptionId of answer.selectedOptionIds) {
                if (!allowedOptionIds.has(selectedOptionId)) {
                    throw new BadRequestException(
                        "One or more selected options are invalid for the question",
                    );
                }
            }
        }

        const submission = await this.assessmentSubmissionRepository.createSubmission({
            userId,
            assessmentId: payload.assessmentId,
            answers: normalizedAnswers,
        });

        // Audit log: assessment submitted by patient
        this.auditLogService
            .createLog({
                userId,
                userName: submission.user?.email ?? userId,
                userRole: "Patient",
                activityType: "Assessment",
                event: `Patient submitted assessment "${submission.assessment?.title ?? payload.assessmentId}"`,
                status: "SUCCESS",
            })
            .catch(() => {});

        return this.mapSubmission(submission);
    }

    private normalizeAnswers(
        answers: CreateAssessmentSubmissionDto["answers"],
    ): Array<{
        questionId: string;
        textResponse?: string | null;
        selectedOptionIds: string[];
    }> {
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
