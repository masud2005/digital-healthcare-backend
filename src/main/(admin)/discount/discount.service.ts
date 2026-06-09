import type { DiscountType } from "@constant/enums";
import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { CreateDiscountDto } from "./dto/create-discount.dto";
import { DiscountQueryDto } from "./dto/discount-query.dto";
import { UpdateDiscountDto } from "./dto/update-discount.dto";
import { DiscountRepository } from "./discount.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

@Injectable()
export class DiscountService {
    constructor(private readonly discountRepository: DiscountRepository) {}

    async create(payload: CreateDiscountDto) {
        const data = this.normalizeCreatePayload(payload);
        await this.ensureCodeIsAvailable(data.code);

        try {
            return await this.discountRepository.create(data);
        } catch (error) {
            this.throwKnownPrismaError(error);
            throw error;
        }
    }

    async findAll(query: DiscountQueryDto) {
        const page = query.page ?? DEFAULT_PAGE;
        const limit = query.limit ?? DEFAULT_LIMIT;

        const { data, total } = await this.discountRepository.findAll({
            page,
            limit,
            search: query.search?.trim(),
            type: query.type,
            isActive: query.isActive,
            minValue: query.minValue,
            maxValue: query.maxValue,
            expiresFrom: this.parseQueryDate(query.expiresFrom, "expiresFrom"),
            expiresTo: this.parseQueryDate(query.expiresTo, "expiresTo"),
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
        const discount = await this.discountRepository.findById(id);

        if (!discount) {
            throw new NotFoundException("Discount not found");
        }

        return discount;
    }

    async update(id: string, payload: UpdateDiscountDto) {
        await this.findOne(id);
        const data = this.normalizeUpdatePayload(payload);

        if (data.code) {
            await this.ensureCodeIsAvailable(data.code, id);
        }

        try {
            return await this.discountRepository.update(id, data);
        } catch (error) {
            this.throwKnownPrismaError(error);
            throw error;
        }
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.discountRepository.delete(id);
    }

    private normalizeCreatePayload(payload: CreateDiscountDto) {
        return {
            code: this.normalizeCode(payload.code),
            type: payload.type,
            value: payload.value,
            expiresAt: this.parseNullableDate(payload.expiresAt),
            ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
        };
    }

    private normalizeUpdatePayload(payload: UpdateDiscountDto) {
        const data: {
            code?: string;
            type?: DiscountType;
            value?: number;
            expiresAt?: Date | null;
            isActive?: boolean;
        } = {};

        if (payload.code !== undefined) {
            data.code = this.normalizeCode(payload.code);
        }

        if (payload.type !== undefined) {
            data.type = payload.type;
        }

        if (payload.value !== undefined) {
            data.value = payload.value;
        }

        if (payload.expiresAt !== undefined) {
            data.expiresAt = this.parseNullableDate(payload.expiresAt);
        }

        if (payload.isActive !== undefined) {
            data.isActive = payload.isActive;
        }

        if (Object.keys(data).length === 0) {
            throw new BadRequestException("At least one discount field is required");
        }

        return data;
    }

    private normalizeCode(code: string) {
        return code.trim().toUpperCase();
    }

    private parseNullableDate(value: Date | null | undefined) {
        if (value === null) {
            return null;
        }

        if (value === undefined) {
            return undefined;
        }

        if (Number.isNaN(value.getTime())) {
            throw new BadRequestException("expiresAt must be a valid date");
        }

        return value;
    }

    private parseQueryDate(value: string | undefined, fieldName: string) {
        if (!value) {
            return undefined;
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            throw new BadRequestException(`${fieldName} must be a valid date`);
        }

        return date;
    }

    private async ensureCodeIsAvailable(code: string, excludeId?: string) {
        const existingDiscount = await this.discountRepository.findByCode(code);

        if (existingDiscount && existingDiscount.id !== excludeId) {
            throw new ConflictException("Discount code already exists");
        }
    }

    private throwKnownPrismaError(error: unknown) {
        const prismaError = error as { code?: string };

        if (prismaError.code === "P2002") {
            throw new ConflictException("Discount code already exists");
        }
    }
}
