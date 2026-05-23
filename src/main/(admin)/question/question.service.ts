import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateQuestionDto } from "./dto/create-question.dto";
import { QuestionQueryDto } from "./dto/question-query.dto";
import { UpdateQuestionDto } from "./dto/update-question.dto";
import { QuestionRepository } from "./question.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

@Injectable()
export class QuestionService {
    constructor(private readonly questionRepository: QuestionRepository) {}

    async create(payload: CreateQuestionDto) {
        const data = this.normalizeCreatePayload(payload);
        await this.ensureAssessmentExists(data.assessmentId);

        try {
            return await this.questionRepository.create(data);
        } catch (error) {
            this.throwKnownPrismaError(error);
            throw error;
        }
    }

    async findAll(query: QuestionQueryDto) {
        const page = query.page ?? DEFAULT_PAGE;
        const limit = query.limit ?? DEFAULT_LIMIT;

        const { data, total } = await this.questionRepository.findAll({
            page,
            limit,
            assessmentId: query.assessmentId,
        });

        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const question = await this.questionRepository.findById(id);

        if (!question) {
            throw new NotFoundException("Question not found");
        }

        return question;
    }

    async update(id: string, payload: UpdateQuestionDto) {
        await this.findOne(id);
        const data = this.normalizeUpdatePayload(payload);

        if (data.assessmentId) {
            await this.ensureAssessmentExists(data.assessmentId);
        }

        try {
            return await this.questionRepository.update(id, data);
        } catch (error) {
            this.throwKnownPrismaError(error);
            throw error;
        }
    }

    async remove(id: string) {
        await this.findOne(id);

        try {
            return await this.questionRepository.delete(id);
        } catch (error) {
            this.throwKnownPrismaError(error);
            throw error;
        }
    }

    private normalizeCreatePayload(payload: CreateQuestionDto) {
        return {
            type: payload.type,
            heading: payload.heading?.trim(),
            media: payload.media?.trim(),
            questionText: payload.questionText?.trim(),
            description: payload.description?.trim(),
            contentAlignment: payload.contentAlignment,
            isRequired: payload.isRequired ?? true,
            assessmentId: payload.assessmentId,
            parentOptionId: payload.parentOptionId,
        };
    }

    private normalizeUpdatePayload(payload: UpdateQuestionDto) {
        const data: any = {};

        if (payload.type !== undefined) data.type = payload.type;
        if (payload.heading !== undefined) data.heading = payload.heading?.trim();
        if (payload.media !== undefined) data.media = payload.media?.trim();
        if (payload.questionText !== undefined) data.questionText = payload.questionText?.trim();
        if (payload.description !== undefined) data.description = payload.description?.trim();
        if (payload.contentAlignment !== undefined) data.contentAlignment = payload.contentAlignment;
        if (payload.isRequired !== undefined) data.isRequired = payload.isRequired;
        if (payload.assessmentId !== undefined) data.assessmentId = payload.assessmentId;
        if (payload.parentOptionId !== undefined) data.parentOptionId = payload.parentOptionId;

        if (Object.keys(data).length === 0) {
            throw new BadRequestException("At least one question field is required");
        }

        return data;
    }

    private async ensureAssessmentExists(assessmentId: string) {
        const exists = await this.questionRepository.findAssessmentById(assessmentId);

        if (!exists) {
            throw new NotFoundException("Assessment not found");
        }
    }

    private throwKnownPrismaError(error: unknown) {
        const prismaError = error as { code?: string };

        if (prismaError.code === "P2003") {
            throw new BadRequestException("Invalid reference id");
        }

        if (prismaError.code === "P2002") {
            throw new ConflictException("Duplicate entry");
        }
    }
}
