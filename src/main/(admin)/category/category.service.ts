import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { CategoryStatus, categoryStatus } from "@constant/enums";
import { CategoryRepository } from "./category.repository";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { CategoryQueryDto } from "./dto/category-query.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

@Injectable()
export class CategoryService {
    constructor(private readonly categoryRepository: CategoryRepository) {}

    async create(payload: CreateCategoryDto) {
        const data = this.normalizeCreatePayload(payload);

        try {
            return await this.categoryRepository.create(data);
        } catch (error) {
            this.throwKnownPrismaError(error);
            throw error;
        }
    }

    async findAll(query: CategoryQueryDto) {
        const page = this.parsePositiveNumber(query.page, DEFAULT_PAGE, "page");
        const limit = this.parsePositiveNumber(query.limit, DEFAULT_LIMIT, "limit", MAX_LIMIT);
        const status = this.parseStatus(query.status);
        const search = query.search?.trim();

        const { data, total } = await this.categoryRepository.findAll({
            page,
            limit,
            status,
            search,
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
        const category = await this.categoryRepository.findById(id);

        if (!category) {
            throw new NotFoundException("Category not found");
        }

        return category;
    }

    async update(id: string, payload: UpdateCategoryDto) {
        await this.findOne(id);
        const data = this.normalizeUpdatePayload(payload);

        try {
            return await this.categoryRepository.update(id, data);
        } catch (error) {
            this.throwKnownPrismaError(error);
            throw error;
        }
    }

    async remove(id: string) {
        await this.findOne(id);

        try {
            return await this.categoryRepository.delete(id);
        } catch (error) {
            this.throwKnownPrismaError(error);
            throw error;
        }
    }

    private normalizeCreatePayload(payload: CreateCategoryDto) {
        const name = this.parseName(payload.name);
        const status = this.parseStatus(payload.status);

        return {
            name,
            description: this.parseDescription(payload.description),
            ...(status ? { status } : {}),
        };
    }

    private normalizeUpdatePayload(payload: UpdateCategoryDto) {
        const data: {
            name?: string;
            description?: string | null;
            status?: CategoryStatus;
        } = {};

        if (payload.name !== undefined) {
            data.name = this.parseName(payload.name);
        }

        if (payload.description !== undefined) {
            data.description = this.parseDescription(payload.description);
        }

        if (payload.status !== undefined) {
            data.status = this.parseStatus(payload.status);
        }

        if (Object.keys(data).length === 0) {
            throw new BadRequestException("At least one category field is required");
        }

        return data;
    }

    private parseName(name: string | undefined) {
        if (typeof name !== "string" || !name.trim()) {
            throw new BadRequestException("Category name is required");
        }

        return name.trim();
    }

    private parseDescription(description: string | null | undefined) {
        if (description === null) {
            return null;
        }

        if (description === undefined) {
            return undefined;
        }

        if (typeof description !== "string") {
            throw new BadRequestException("Category description must be a string");
        }

        const trimmed = description.trim();
        return trimmed.length > 0 ? trimmed : null;
    }

    private parseStatus(status: CategoryStatus | undefined) {
        if (status === undefined) {
            return undefined;
        }

        if (!categoryStatus.includes(status)) {
            throw new BadRequestException("Invalid category status");
        }

        return status;
    }

    private parsePositiveNumber(
        value: string | undefined,
        fallback: number,
        field: string,
        max?: number,
    ) {
        if (value === undefined) {
            return fallback;
        }

        const parsed = Number(value);
        if (!Number.isInteger(parsed) || parsed < 1) {
            throw new BadRequestException(`${field} must be a positive integer`);
        }

        if (max && parsed > max) {
            throw new BadRequestException(`${field} must be less than or equal to ${max}`);
        }

        return parsed;
    }

    private throwKnownPrismaError(error: unknown) {
        const prismaError = error as { code?: string };

        if (prismaError.code === "P2002") {
            throw new ConflictException("Category name already exists");
        }

        if (prismaError.code === "P2003") {
            throw new BadRequestException("Category is still referenced by another record");
        }
    }
}
