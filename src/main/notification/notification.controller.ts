import { Roles } from "@common/decorators";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { RolesGuard } from "@common/guards";
import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import type { AuthenticatedUser } from "@main/auth/auth.types";
import { Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { NotificationService } from "./notification.service";

@ApiTags("Notification")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN", "DOCTOR", "PATIENT")
@Controller("notifications")
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @Get()
    @ApiOperation({ summary: "Get all notifications for the current user" })
    async getMyNotifications(@CurrentUser() user: AuthenticatedUser) {
        const data = await this.notificationService.getMyNotifications(user.id);
        return { success: true, statusCode: 200, message: "Notifications retrieved", data };
    }

    @Patch(":id/read")
    @ApiOperation({ summary: "Mark a notification as read" })
    async markAsRead(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
        await this.notificationService.markAsRead(id, user.id);
        return { success: true, statusCode: 200, message: "Notification marked as read" };
    }

    @Patch("read-all")
    @ApiOperation({ summary: "Mark all notifications as read" })
    async markAllAsRead(@CurrentUser() user: AuthenticatedUser) {
        await this.notificationService.markAllAsRead(user.id);
        return { success: true, statusCode: 200, message: "All notifications marked as read" };
    }
}
