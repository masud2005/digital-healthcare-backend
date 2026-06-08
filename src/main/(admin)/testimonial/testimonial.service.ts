import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateTestimonialDto } from "./dto/create-testimonial.dto";
import { TestimonialQueryDto } from "./dto/testimonial-query.dto";
import { UpdateTestimonialDto } from "./dto/update-testimonial.dto";
import { TestimonialRepository } from "./testimonial.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

@Injectable()
export class TestimonialService {
    constructor(private readonly testimonialRepository: TestimonialRepository) {}

    create(payload: CreateTestimonialDto) {
        return this.testimonialRepository.create(this.normalizeCreatePayload(payload));
    }

    async findAll(query: TestimonialQueryDto) {
        const page = query.page ?? DEFAULT_PAGE;
        const limit = query.limit ?? DEFAULT_LIMIT;

        const { data, total } = await this.testimonialRepository.findAll({
            page,
            limit,
            search: query.search?.trim(),
            minRating: query.minRating,
            maxRating: query.maxRating,
            fromDate: this.parseQueryDate(query.fromDate, "fromDate"),
            toDate: this.parseQueryDate(query.toDate, "toDate"),
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
        const testimonial = await this.testimonialRepository.findById(id);

        if (!testimonial) {
            throw new NotFoundException("Testimonial not found");
        }

        return testimonial;
    }

    async update(id: string, payload: UpdateTestimonialDto) {
        await this.findOne(id);
        return this.testimonialRepository.update(id, this.normalizeUpdatePayload(payload));
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.testimonialRepository.delete(id);
    }

    private normalizeCreatePayload(payload: CreateTestimonialDto) {
        return {
            clientName: payload.clientName.trim(),
            feedback: this.parseOptionalText(payload.feedback),
            rating: payload.rating,
            date: payload.date,
        };
    }

    private normalizeUpdatePayload(payload: UpdateTestimonialDto) {
        const data: {
            clientName?: string;
            feedback?: string | null;
            rating?: number;
            date?: Date;
        } = {};

        if (payload.clientName !== undefined) {
            data.clientName = payload.clientName.trim();
        }

        if (payload.feedback !== undefined) {
            data.feedback = this.parseOptionalText(payload.feedback);
        }

        if (payload.rating !== undefined) {
            data.rating = payload.rating;
        }

        if (payload.date !== undefined) {
            data.date = payload.date;
        }

        if (Object.keys(data).length === 0) {
            throw new BadRequestException("At least one testimonial field is required");
        }

        return data;
    }

    private parseOptionalText(value: string | null | undefined) {
        if (value === null) {
            return null;
        }

        if (value === undefined) {
            return undefined;
        }

        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
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
}
