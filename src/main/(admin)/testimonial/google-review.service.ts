import { HttpException, Injectable, Logger } from "@nestjs/common";

export interface GooglePlaceReview {
    /** Stable unique key — the `name` field from Places API v1, e.g. "places/ChIJ.../reviews/xxxxx" */
    googleReviewId: string;
    clientName: string;
    profilePhotoUrl?: string;
    rating: number;
    feedback: string;
    date: Date;
}

@Injectable()
export class GoogleReviewService {
    private readonly logger = new Logger(GoogleReviewService.name);
    private readonly apiKey: string;
    private readonly placeId: string;

    constructor() {
        this.apiKey = process.env.GOOGLE_PLACE_API_KEY?.trim() || "";
        this.placeId = process.env.GOOGLE_PLACE_ID?.trim() || "";
    }

    /**
     * Fetches reviews from the Google Places API v1.
     * Uses X-Goog-FieldMask to limit the response to only what we need.
     */
    async fetchReviews(): Promise<GooglePlaceReview[]> {
        if (!this.apiKey) {
            throw new Error("GOOGLE_PLACE_API_KEY is not configured");
        }
        if (!this.placeId) {
            throw new Error("GOOGLE_PLACE_ID is not configured");
        }

        const url = `https://places.googleapis.com/v1/places/${this.placeId}?key=${this.apiKey}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "X-Goog-FieldMask": "id,displayName,reviews",
            },
        });

        if (!response.ok) {
            const body = await response.text();
            throw new HttpException(
                `Google Places API request failed (${response.status}): ${body}`,
                response.status,
            );
        }

        const data = await response.json();

        if (!data.reviews || !Array.isArray(data.reviews)) {
            this.logger.warn("Google Places API returned no reviews array");
            return [];
        }

        return data.reviews.map(
            (review: any): GooglePlaceReview => ({
                // `review.name` is the stable unique identifier for this review across calls
                googleReviewId: review.name as string,
                clientName: review.authorAttribution?.displayName ?? "Anonymous",
                profilePhotoUrl: review.authorAttribution?.photoUri,
                rating: review.rating ?? 0,
                // Places API v1 returns localised text object: { text, languageCode }
                feedback: review.text?.text ?? "",
                date: review.publishTime ? new Date(review.publishTime) : new Date(),
            }),
        );
    }
}
