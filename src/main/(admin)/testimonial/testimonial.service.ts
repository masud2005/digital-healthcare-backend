import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
    OnModuleInit,
} from "@nestjs/common";
import { CreateTestimonialDto } from "./dto/create-testimonial.dto";
import { TestimonialQueryDto } from "./dto/testimonial-query.dto";
import { UpdateTestimonialDto } from "./dto/update-testimonial.dto";
import { TestimonialRepository } from "./testimonial.repository";
import { GoogleReviewService } from "./google-review.service";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const FALLBACK_REVIEWS = [
    {
        clientName: "Sarah Jenkins",
        feedback:
            "The staff is incredibly professional and caring. The treatment plan they set up for me has been life-changing. Highly recommend!",
        rating: 5,
        date: new Date("2026-05-15T10:00:00Z"),
    },
    {
        clientName: "David Chen",
        feedback:
            "Very clean facility and friendly environment. The doctors take their time to explain everything clearly. Highly satisfied with my progress.",
        rating: 5,
        date: new Date("2026-05-20T14:30:00Z"),
    },
    {
        clientName: "Emily Rodriguez",
        feedback:
            "Exceptional care and attention to detail. They truly listen to your concerns and customize the approach. A fantastic experience overall.",
        rating: 4.8,
        date: new Date("2026-05-25T09:15:00Z"),
    },
    {
        clientName: "Marcus Thompson",
        feedback:
            "Great results so far. The follow-up care has been very consistent and encouraging. Professional service at every step.",
        rating: 4.5,
        date: new Date("2026-06-01T11:00:00Z"),
    },
    {
        clientName: "Amanda Ross",
        feedback:
            "I was hesitant at first, but the team made me feel comfortable immediately. Excellent results and support throughout the journey.",
        rating: 5,
        date: new Date("2026-06-05T16:20:00Z"),
    },
];

@Injectable()
export class TestimonialService implements OnModuleInit {
    private readonly logger = new Logger(TestimonialService.name);

    constructor(
        private readonly testimonialRepository: TestimonialRepository,
        private readonly googleReviewService: GoogleReviewService,
    ) {}

    async onModuleInit() {
        await this.seedTestimonials();
    }

    async seedTestimonials() {
        try {
            const count = await this.testimonialRepository.count();
            if (count > 0) {
                this.logger.debug("Testimonials already exist in the database. Skipping seeding.");
                return;
            }

            this.logger.log("🌱 Starting testimonial seeding...");

            const placeId = process.env.GOOGLE_MAPS_PLACE_ID?.trim() || "";
            let reviews: any[] = [];

            if (placeId) {
                try {
                    const fetchedReviews = await this.googleReviewService.getReviews(placeId);
                    if (fetchedReviews && fetchedReviews.length > 0) {
                        reviews = fetchedReviews;
                        this.logger.log(`Fetched ${reviews.length} reviews from Google Places API`);
                    }
                } catch (error) {
                    this.logger.error(
                        `Failed to fetch Google reviews: ${(error as Error).message}. Falling back to default testimonial data.`,
                    );
                }
            } else {
                this.logger.log(
                    "GOOGLE_MAPS_PLACE_ID not provided. Using default fallback reviews.",
                );
            }

            if (reviews.length === 0) {
                reviews = FALLBACK_REVIEWS;
                this.logger.log(`Using ${reviews.length} fallback testimonials`);
            }

            for (const review of reviews) {
                await this.testimonialRepository.create({
                    clientName: review.clientName ?? review.authorName,
                    feedback: review.feedback ?? review.text,
                    rating: review.rating,
                    date: review.date ?? (review.time ? new Date(review.time * 1000) : new Date()),
                });
            }

            this.logger.log(`✅ Successfully seeded ${reviews.length} testimonials.`);
        } catch (error) {
            this.logger.error("Failed to seed testimonials", error as Error);
        }
    }

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
