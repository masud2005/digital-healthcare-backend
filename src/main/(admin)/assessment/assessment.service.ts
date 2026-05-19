import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { AssessmentRepository } from "./assessment.repository";
import { AssessmentQueryDto } from "./dto/assessment-query.dto";
import { CreateAssessmentDto } from "./dto/create-assessment.dto";
import { UpdateAssessmentDto } from "./dto/update-assessment.dto";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

@Injectable()
export class AssessmentService {
    constructor(private readonly assessmentRepository: AssessmentRepository) {}

    async create(payload: CreateAssessmentDto) {
        const data = this.normalizeCreatePayload(payload);
        await this.ensureCategoryExists(data.categoryId);

        try {
            return await this.assessmentRepository.create(data);
        } catch (error) {
            this.throwKnownPrismaError(error);
            throw error;
        }
    }

    async findAll(query: AssessmentQueryDto) {
        const page = query.page ?? DEFAULT_PAGE;
        const limit = query.limit ?? DEFAULT_LIMIT;

        const { data, total } = await this.assessmentRepository.findAll({
            page,
            limit,
            status: query.status,
            categoryId: query.categoryId,
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
        const assessment = await this.assessmentRepository.findById(id);

        if (!assessment) {
            throw new NotFoundException("Assessment not found");
        }

        return assessment;
    }

    async update(id: string, payload: UpdateAssessmentDto) {
        await this.findOne(id);
        const data = this.normalizeUpdatePayload(payload);

        if (data.categoryId) {
            await this.ensureCategoryExists(data.categoryId);
        }

        try {
            return await this.assessmentRepository.update(id, data);
        } catch (error) {
            this.throwKnownPrismaError(error);
            throw error;
        }
    }

    async remove(id: string) {
        await this.findOne(id);

        try {
            return await this.assessmentRepository.delete(id);
        } catch (error) {
            this.throwKnownPrismaError(error);
            throw error;
        }
    }

    private normalizeCreatePayload(payload: CreateAssessmentDto) {
        return {
            title: this.normalizeText(payload.title, "title"),
            thumbnail: this.parseThumbnail(payload.thumbnail),
            description: this.normalizeText(payload.description, "description"),
            ...(payload.status ? { status: payload.status } : {}),
            categoryId: payload.categoryId,
        };
    }

    private normalizeUpdatePayload(payload: UpdateAssessmentDto) {
        const data: {
            title?: string;
            thumbnail?: string | null;
            description?: string;
            status?: UpdateAssessmentDto["status"];
            categoryId?: string;
        } = {};

        if (payload.title !== undefined) {
            data.title = this.normalizeText(payload.title, "title");
        }

        if (payload.thumbnail !== undefined) {
            data.thumbnail = this.parseThumbnail(payload.thumbnail);
        }

        if (payload.description !== undefined) {
            data.description = this.normalizeText(payload.description, "description");
        }

        if (payload.status !== undefined) {
            data.status = payload.status;
        }

        if (payload.categoryId !== undefined) {
            data.categoryId = payload.categoryId;
        }

        if (Object.keys(data).length === 0) {
            throw new BadRequestException("At least one assessment field is required");
        }

        return data;
    }

    private normalizeText(value: string, fieldName: string) {
        const trimmed = value.trim();

        if (!trimmed) {
            throw new BadRequestException(`Assessment ${fieldName} is required`);
        }

        return trimmed;
    }

    private parseThumbnail(thumbnail: string | null | undefined) {
        if (thumbnail === null) {
            return null;
        }

        if (thumbnail === undefined) {
            return undefined;
        }

        const trimmed = thumbnail.trim();
        return trimmed.length > 0 ? trimmed : null;
    }

    private async ensureCategoryExists(categoryId: string) {
        const category = await this.assessmentRepository.findCategoryById(categoryId);

        if (!category) {
            throw new NotFoundException("Category not found");
        }
    }

    private throwKnownPrismaError(error: unknown) {
        const prismaError = error as { code?: string };

        if (prismaError.code === "P2003") {
            throw new BadRequestException("Invalid category id");
        }

        if (prismaError.code === "P2002") {
            throw new ConflictException("Assessment already exists");
        }
    }
}