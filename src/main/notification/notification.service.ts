import { Injectable } from "@nestjs/common";
import { NotificationGateway } from "./notification.gateway";
import { NotificationRepository } from "./notification.repository";

export interface SendNotificationPayload {
    userId: string;
    title: string;
    message: string;
    actionType: string;
    referenceId: string;
}

@Injectable()
export class NotificationService {
    constructor(
        private readonly repo: NotificationRepository,
        private readonly gateway: NotificationGateway,
    ) {}

    /** Save to DB and push realtime — call this from anywhere */
    async send(payload: SendNotificationPayload) {
        const notification = await this.repo.create(payload);
        this.gateway.pushToUser(payload.userId, notification);
        return notification;
    }

    /** Send to all admins at once */
    async sendToAdmins(data: Omit<SendNotificationPayload, "userId">) {
        const admins = await this.repo.findAdminUserIds();
        await Promise.all(admins.map((a) => this.send({ ...data, userId: a.userId })));
    }

    async getMyNotifications(userId: string) {
        const [notifications, unreadCount] = await Promise.all([
            this.repo.findAllByUser(userId),
            this.repo.unreadCount(userId),
        ]);
        return { notifications, unreadCount };
    }

    markAsRead(id: string, userId: string) {
        return this.repo.markAsRead(id, userId);
    }

    markAllAsRead(userId: string) {
        return this.repo.markAllAsRead(userId);
    }
}
