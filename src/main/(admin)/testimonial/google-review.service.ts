import { HttpException, Injectable } from "@nestjs/common";

export interface GoogleReview {
    authorName: string;
    profilePhotoUrl?: string;
    rating: number;
    text: string;
    relativeTimeDescription: string;
    time: number;
}

@Injectable()
export class GoogleReviewService {
    private readonly apiKey: string;

    constructor() {
        this.apiKey = process.env.GOOGLE_MAPS_API_KEY || "";
    }

    async getReviews(placeId: string): Promise<GoogleReview[]> {
        if (!this.apiKey) {
            throw new Error("GOOGLE_MAPS_API_KEY is not configured");
        }
        if (!placeId) {
            throw new Error("Place ID is not configured");
        }

        const params = new URLSearchParams({
            place_id: placeId,
            fields: "reviews",
            key: this.apiKey,
        });

        const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?${params}`,
        );

        if (!response.ok) {
            throw new HttpException(
                `Google API request failed: ${response.status}`,
                response.status,
            );
        }

        const data = await response.json();

        if (data.status !== "OK") {
            throw new HttpException(data.error_message || data.status, 400);
        }

        return (
            data.result?.reviews?.map((review: any) => ({
                authorName: review.author_name,
                profilePhotoUrl: review.profile_photo_url,
                rating: review.rating,
                text: review.text,
                relativeTimeDescription: review.relative_time_description,
                time: review.time,
            })) || []
        );
    }
}
