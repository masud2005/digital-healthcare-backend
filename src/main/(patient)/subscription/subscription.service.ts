import { Injectable, NotFoundException } from "@nestjs/common";
import { SubscriptionRepository } from "./subscription.repository";

@Injectable()
export class SubscriptionService {
    constructor(private readonly subscriptionRepository: SubscriptionRepository) {}

    /**
     * Get all subscriptions belonging to the authenticated patient.
     */
    async getMySubscriptions(userId: string) {
        return this.subscriptionRepository.findAllByUser(userId);
    }

    /**
     * Get a single subscription by ID (must belong to the patient).
     */
    async getMySubscriptionById(subscriptionId: string, userId: string) {
        const subscription = await this.subscriptionRepository.findOneByUser(
            subscriptionId,
            userId,
        );
        if (!subscription) {
            throw new NotFoundException("Subscription not found.");
        }
        return subscription;
    }

    /**
     * Toggle recurring billing ON or OFF for a specific subscription.
     * - ON  → next billing date will auto-charge via Clover
     * - OFF → subscription continues until period ends, no auto-renewal
     */
    async toggleRecurring(subscriptionId: string, userId: string, isRecurring: boolean) {
        const subscription = await this.subscriptionRepository.findOneByUser(
            subscriptionId,
            userId,
        );
        if (!subscription) {
            throw new NotFoundException("Subscription not found.");
        }

        const updated = await this.subscriptionRepository.updateIsRecurring(
            subscriptionId,
            userId,
            isRecurring,
        );

        return {
            ...updated,
            message: isRecurring
                ? "Auto-renewal has been enabled. Your subscription will automatically renew on the next billing date."
                : "Auto-renewal has been disabled. Your subscription will remain active until the current period ends.",
        };
    }
}
