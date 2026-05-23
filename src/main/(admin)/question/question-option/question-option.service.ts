import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateQuestionOptionDto } from "./dto/create-question-option.dto";
import { QuestionOptionQueryDto } from "./dto/question-option-query.dto";
import { UpdateQuestionOptionDto } from "./dto/update-question-option.dto";
import { QuestionOptionRepository } from "./question-option.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

@Injectable()
export class QuestionOptionService {
    constructor(private readonly questionOptionRepository: QuestionOptionRepository) {}

    async create(payload: CreateQuestionOptionDto) {
        const data = this.normalizeCreatePayload(payload);
        await this.ensureQuestionExists(data.questionId);

        try {
            return await this.questionOptionRepository.create(data);
        } catch (error) {
            this.throwKnownPrismaError(error);
            throw error;
        }
    }

    async findAll(query: QuestionOptionQueryDto) {
        const page = query.page ?? DEFAULT_PAGE;
        const limit = query.limit ?? DEFAULT_LIMIT;

        const { data, total } = await this.questionOptionRepository.findAll({
            page,
            limit,
            questionId: query.questionId,
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
        const option = await this.questionOptionRepository.findById(id);

        if (!option) {
            throw new NotFoundException("Question option not found");
        }

        return option;
    }

    async update(id: string, payload: UpdateQuestionOptionDto) {
        await this.findOne(id);
        const data = this.normalizeUpdatePayload(payload);

        if (data.questionId) {
            await this.ensureQuestionExists(data.questionId);
        }

        try {
            return await this.questionOptionRepository.update(id, data);
        } catch (error) {
            this.throwKnownPrismaError(error);
            throw error;
        }
    }

    async remove(id: string) {
        await this.findOne(id);

        try {
            return await this.questionOptionRepository.delete(id);
        } catch (error) {
            this.throwKnownPrismaError(error);
            throw error;
        }
    }

    private normalizeCreatePayload(payload: CreateQuestionOptionDto) {
        return {
            label: payload.label.trim(),
            placeholder: payload.placeholder?.trim(),
            inputType: payload.inputType?.trim(),
            questionId: payload.questionId,
        };
    }

    private normalizeUpdatePayload(payload: UpdateQuestionOptionDto) {
        const data: any = {};

        if (payload.label !== undefined) data.label = payload.label.trim();
        if (payload.placeholder !== undefined) data.placeholder = payload.placeholder?.trim();
        if (payload.inputType !== undefined) data.inputType = payload.inputType?.trim();
        if (payload.questionId !== undefined) data.questionId = payload.questionId;

        if (Object.keys(data).length === 0) {
            throw new BadRequestException("At least one question option field is required");
        }

        return data;
    }

    private async ensureQuestionExists(questionId: string) {
        const exists = await this.questionOptionRepository.findQuestionById(questionId);

        if (!exists) {
            throw new NotFoundException("Question not found");
        }
    }

    private throwKnownPrismaError(error: unknown) {
        const prismaError = error as { code?: string };

        if (prismaError.code === "P2003") {
            throw new BadRequestException("Invalid reference id");
        }

        if (prismaError.code === "P2002") {
            throw new BadRequestException("Duplicate entry");
        }
    }
}
