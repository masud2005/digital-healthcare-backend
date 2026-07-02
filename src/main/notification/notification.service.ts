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
        const preference = await this.repo.getUserPreference(payload.userId);
        if (preference && preference.pushNotifications === false) {
            return null; // Skip notification based on user preference
        }

        const notification = await this.repo.create(payload);
        this.gateway.pushToUser(payload.userId, notification);
        return notification;
    }

    /** Send to all admins at once */
    async sendToAdmins(data: Omit<SendNotificationPayload, "userId">) {
        const admins = await this.repo.findAdminUserIds();
        await Promise.all(admins.map((a) => this.send({ ...data, userId: a.userId })));
    }

    /** Send to all doctors at once */
    async sendToDoctors(data: Omit<SendNotificationPayload, "userId">) {
        const doctors = await this.repo.findDoctorUserIds();
        await Promise.all(doctors.map((d) => this.send({ ...data, userId: d.userId })));
    }

    /** Send to all patients at once */
    async sendToPatients(data: Omit<SendNotificationPayload, "userId">) {
        const patients = await this.repo.findPatientUserIds();
        await Promise.all(patients.map((p) => this.send({ ...data, userId: p.userId })));
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
