import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class NotificationRepository {
    constructor(private readonly prisma: PrismaService) {}

    create(data: { userId: string; title: string; message: string; actionType: string; referenceId: string }) {
        return this.prisma.notification.create({ data });
    }

    findAllByUser(userId: string) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    }

    markAsRead(id: string, userId: string) {
        return this.prisma.notification.updateMany({
            where: { id, userId },
            data: { isRead: true },
        });
    }

    markAllAsRead(userId: string) {
        return this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
    }

    unreadCount(userId: string) {
        return this.prisma.notification.count({ where: { userId, isRead: false } });
    }

    findAdminUserIds() {
        return this.prisma.userRole.findMany({
            where: { role: { name: "ADMIN" } },
            select: { userId: true },
        });
    }
}
