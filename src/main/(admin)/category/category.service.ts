import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { slugify } from "@util/functions";
import { StorageService } from "@global/storage/storage.service";
import { CategoryRepository } from "./category.repository";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { CategoryQueryDto } from "./dto/category-query.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import type { BillingCycle, CategoryStatus } from "@constant/enums";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
@Injectable()
export class CategoryService {
    constructor(
        private readonly categoryRepository: CategoryRepository,
        private readonly storageService: StorageService,
    ) {}

    async create(payload: CreateCategoryDto) {
        const data = this.normalizeCreatePayload(payload);
        await this.ensureSlugIsAvailable(data.slug);

        try {
            return await this.categoryRepository.create(data);
        } catch (error) {
            this.throwKnownPrismaError(error);
            throw error;
        }
    }

    async findAll(query: CategoryQueryDto) {
        const page = query.page ?? DEFAULT_PAGE;
        const limit = query.limit ?? DEFAULT_LIMIT;
        const search = query.search?.trim();

        const { data, total } = await this.categoryRepository.findAll({
            page,
            limit,
            status: query.status,
            search,
        });

        const resolved = await Promise.all(data.map((c) => this.resolveIcon(c)));

        return {
            data: resolved,
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

        return this.resolveIcon(category);
    }

    async update(id: string, payload: UpdateCategoryDto) {
        await this.findOne(id);
        const data = this.normalizeUpdatePayload(payload);

        if (data.slug) {
            await this.ensureSlugIsAvailable(data.slug, id);
        }

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
        const name = payload.name.trim();
        const slug = slugify(name);
        return {
            name,
            slug,
            description: this.parseDescription(payload.description),
            ...(payload.status ? { status: payload.status } : {}),
            ...(payload.iconId ? { iconId: payload.iconId } : {}),
            ...(payload.paymentPlan ? { paymentPlan: payload.paymentPlan } : {}),
        };
    }

    private normalizeUpdatePayload(payload: UpdateCategoryDto) {
        const data: {
            name?: string;
            slug?: string;
            description?: string | null;
            status?: CategoryStatus;
            iconId?: string | null;
            paymentPlan?: { price?: number; billingCycle?: BillingCycle };
        } = {};

        if (payload.name !== undefined) {
            data.name = payload.name.trim();
            data.slug = slugify(data.name);
        }

        if (payload.description !== undefined) {
            data.description = this.parseDescription(payload.description);
        }

        if (payload.status !== undefined) {
            data.status = payload.status;
        }

        if (payload.iconId !== undefined) {
            data.iconId = payload.iconId;
        }

        if (payload.paymentPlan !== undefined) {
            data.paymentPlan = payload.paymentPlan;
        }

        if (Object.keys(data).length === 0) {
            throw new BadRequestException("At least one category field is required");
        }

        return data;
    }

    private async resolveIcon<T extends { icon: { fileUrl: string } | null }>(category: T) {
        if (!category.icon) return category;
        return {
            ...category,
            icon: {
                ...category.icon,
                fileUrl: await this.storageService.getSignedUrl(category.icon.fileUrl),
            },
        };
    }

    private parseDescription(description: string | null | undefined) {
        if (description === null) {
            return null;
        }

        if (description === undefined) {
            return undefined;
        }

        const trimmed = description.trim();
        return trimmed.length > 0 ? trimmed : null;
    }

    private async ensureSlugIsAvailable(slug: string, excludeId?: string) {
        const existingCategory = await this.categoryRepository.findBySlug(slug);

        if (existingCategory && existingCategory.id !== excludeId) {
            throw new ConflictException("Category slug already exists");
        }
    }

    private throwKnownPrismaError(error: unknown) {
        const prismaError = error as { code?: string };

        if (prismaError.code === "P2002") {
            throw new ConflictException("Category slug already exists");
        }

        if (prismaError.code === "P2003") {
            throw new BadRequestException("Category is still referenced by another record");
        }
    }
}
