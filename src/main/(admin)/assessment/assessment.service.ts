import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { StorageService } from "@global/storage/storage.service";
import { AuditLogService } from "../../(compliance)/audit-log/audit-log.service";
import {
    type AssessmentDetailRecord,
    type AssessmentRecord,
    AssessmentRepository,
} from "./assessment.repository";
import { AssessmentQueryDto } from "./dto/assessment-query.dto";
import { CreateAssessmentDto } from "./dto/create-assessment.dto";
import { UpdateAssessmentDto } from "./dto/update-assessment.dto";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

@Injectable()
export class AssessmentService {
    constructor(
        private readonly assessmentRepository: AssessmentRepository,
        private readonly storageService: StorageService,
        private readonly auditLogService: AuditLogService,
    ) {}

    async create(payload: CreateAssessmentDto) {
        const data = this.normalizeCreatePayload(payload);
        await this.ensureCategoryExists(data.categoryId);

        try {
            const assessment = await this.assessmentRepository.create(data);

            this.auditLogService
                .createLog({
                    userName: "Admin",
                    userRole: "Admin",
                    activityType: "Record Edit",
                    event: `Admin created assessment "${assessment.title}"`,
                    status: "SUCCESS",
                })
                .catch(() => {});

            return this.mapAssessment(assessment);
        } catch (error) {
            this.throwKnownPrismaError(error);
            throw error;
        }
    }

    async findAll(query: AssessmentQueryDto) {
        const page = query.page ?? DEFAULT_PAGE;
        const limit = query.limit ?? DEFAULT_LIMIT;
        const categoryName = this.normalizeQueryText(query.categoryName);

        const { data, total } = await this.assessmentRepository.findAll({
            page,
            limit,
            status: query.status,
            categoryName,
        });

        return {
            data: await Promise.all(data.map((assessment) => this.mapAssessment(assessment))),
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

        return this.mapAssessmentDetail(assessment);
    }

    async update(id: string, payload: UpdateAssessmentDto) {
        await this.findOne(id);
        const data = this.normalizeUpdatePayload(payload);

        if (data.categoryId) {
            await this.ensureCategoryExists(data.categoryId);
        }

        try {
            const assessment = await this.assessmentRepository.update(id, data);

            this.auditLogService
                .createLog({
                    userName: "Admin",
                    userRole: "Admin",
                    activityType: "Record Edit",
                    event: `Admin updated assessment "${assessment.title}"`,
                    status: "SUCCESS",
                })
                .catch(() => {});

            return this.mapAssessment(assessment);
        } catch (error) {
            this.throwKnownPrismaError(error);
            throw error;
        }
    }

    async remove(id: string) {
        const assessment = await this.findOne(id);

        try {
            const result = await this.assessmentRepository.delete(id);

            this.auditLogService
                .createLog({
                    userName: "Admin",
                    userRole: "Admin",
                    activityType: "Record Edit",
                    event: `Admin deleted assessment "${assessment.title}"`,
                    status: "SUCCESS",
                })
                .catch(() => {});

            return result;
        } catch (error) {
            this.throwKnownPrismaError(error);
            throw error;
        }
    }

    private normalizeCreatePayload(payload: CreateAssessmentDto) {
        const status = payload.status ?? "DRAFT";

        return {
            title: this.normalizeText(payload.title, "title"),
            thumbnail: this.parseThumbnail(payload.thumbnail),
            description: this.normalizeText(payload.description, "description"),
            status,
            publishedAt: status === "ACTIVE" ? new Date() : null,
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
            publishedAt?: Date | null;
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
            data.publishedAt = payload.status === "ACTIVE" ? new Date() : null;
        }

        if (payload.categoryId !== undefined) {
            data.categoryId = payload.categoryId;
        }

        if (Object.keys(data).length === 0) {
            throw new BadRequestException("At least one assessment field is required");
        }

        return data;
    }

    async findStats() {
        return this.assessmentRepository.findStats();
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

    private normalizeQueryText(value?: string) {
        const trimmed = value?.trim();

        return trimmed ? trimmed : undefined;
    }

    private async mapAssessment(assessment: AssessmentRecord) {
        const { _count, ...rest } = assessment;

        return {
            ...rest,
            thumbnail: await this.storageService.resolveKey(rest.thumbnail),
            totalQuestions: _count.questions,
            totalAssessments: _count.questions,
        };
    }

    private async mapAssessmentDetail(assessment: AssessmentDetailRecord) {
        const { _count, questions, ...rest } = assessment;

        return {
            ...rest,
            thumbnail: await this.storageService.resolveKey(rest.thumbnail),
            questions: this.buildQuestionTree(questions),
            totalQuestions: _count.questions,
            totalAssessments: _count.questions,
        };
    }

    private buildQuestionTree(questions: AssessmentDetailRecord["questions"]) {
        const questionsByParentOptionId = new Map<string, AssessmentDetailRecord["questions"]>();

        for (const question of questions) {
            if (!question.parentOptionId) {
                continue;
            }

            const groupedQuestions = questionsByParentOptionId.get(question.parentOptionId) ?? [];
            groupedQuestions.push(question);
            questionsByParentOptionId.set(question.parentOptionId, groupedQuestions);
        }

        const buildNode = (question: AssessmentDetailRecord["questions"][number]) => ({
            ...question,
            options: question.options.map((option) => ({
                ...option,
                subQuestions: (questionsByParentOptionId.get(option.id) ?? []).map(
                    (childQuestion) => buildNode(childQuestion),
                ),
            })),
        });

        return questions
            .filter((question) => !question.parentOptionId)
            .map((question) => buildNode(question));
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
