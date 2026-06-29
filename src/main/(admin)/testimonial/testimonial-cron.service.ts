import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { GoogleReviewService } from "./google-review.service";
import { TestimonialRepository } from "./testimonial.repository";

@Injectable()
export class TestimonialCronService {
    private readonly logger = new Logger(TestimonialCronService.name);

    constructor(
        private readonly googleReviewService: GoogleReviewService,
        private readonly testimonialRepository: TestimonialRepository,
    ) {}

    /**
     * Runs every day at 2:00 AM server time.
     *
     * Sync strategy:
     *  - Fetch all reviews from Google Places API v1.
     *  - For each review, upsert by its stable `googleReviewId` (the `review.name` from the API).
     *  - If a review already exists AND `isGoogleReviewDirty = true` (admin edited it), skip it.
     *  - Manually created testimonials (googleReviewId = null) are never touched.
     */
    @Cron(CronExpression.EVERY_DAY_AT_2AM)
    async syncGoogleReviews() {
        this.logger.log("🔄 Starting Google Reviews sync...");

        let reviews: Awaited<ReturnType<typeof this.googleReviewService.fetchReviews>>;

        try {
            reviews = await this.googleReviewService.fetchReviews();
        } catch (error: any) {
            this.logger.error(`❌ Failed to fetch reviews from Google Places API: ${error.message}`);
            return;
        }

        if (reviews.length === 0) {
            this.logger.warn("⚠️  Google Places API returned 0 reviews. Nothing to sync.");
            return;
        }

        this.logger.log(`📥 Fetched ${reviews.length} reviews from Google. Processing...`);

        let created = 0;
        let updated = 0;
        let skipped = 0;
        let errors = 0;

        for (const review of reviews) {
            try {
                const { action } = await this.testimonialRepository.upsertByGoogleReviewId({
                    googleReviewId: review.googleReviewId,
                    clientName: review.clientName,
                    feedback: review.feedback,
                    rating: review.rating,
                    date: review.date,
                    googleAvatarUrl: review.profilePhotoUrl,
                });

                if (action === "created") created++;
                else if (action === "updated") updated++;
                else if (action === "skipped") skipped++;
            } catch (error: any) {
                errors++;
                this.logger.error(
                    `❌ Failed to upsert review "${review.googleReviewId}": ${error.message}`,
                );
            }
        }

        this.logger.log(
            `✅ Google Reviews sync complete — created: ${created}, updated: ${updated}, skipped (admin-edited): ${skipped}, errors: ${errors}`,
        );
    }
}
