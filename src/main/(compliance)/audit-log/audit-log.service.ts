import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { AuditLogRepository } from "./audit-log.repository";
import { AuditLogQueryDto } from "./dto/audit-log-query.dto";
import { DEFAULT_AUDIT_LOGS, generateExtraLogs } from "./audit-log-seed.data";
import { ExportService } from "@global/export/export.service";
import { IncidentService } from "../incident/incident.service";
import { PrismaService } from "@global/prisma/prisma.service";
import type { AuthenticatedUser } from "@main/auth/auth.types";

@Injectable()
export class AuditLogService implements OnModuleInit {
    private readonly logger = new Logger(AuditLogService.name);

    constructor(
        private readonly auditLogRepository: AuditLogRepository,
        private readonly exportService: ExportService,
        private readonly incidentService: IncidentService,
        private readonly prisma: PrismaService,
    ) {}

    async onModuleInit() {
        // await this.seedAuditLogs();
    }

    async seedAuditLogs() {
        try {
            const count = await this.auditLogRepository.count({});
            if (count > 0) return;

            this.logger.log("🌱 Seeding audit logs...");

            for (const log of DEFAULT_AUDIT_LOGS) {
                await this.auditLogRepository.create(log);
            }

            const extra = generateExtraLogs();
            for (const log of extra) {
                await this.auditLogRepository.create(log);
            }

            this.logger.log("✅ Audit logs successfully seeded.");
        } catch (error) {
            this.logger.error("Failed to seed audit logs", error as Error);
        }
    }

    async getStats() {
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

        const totalActivities = await this.auditLogRepository.count({});
        const prevDayActivities = await this.auditLogRepository.count({
            createdAt: { gte: fortyEightHoursAgo, lte: twentyFourHoursAgo },
        });
        const todayActivities = await this.auditLogRepository.count({
            createdAt: { gte: twentyFourHoursAgo },
        });
        const activitiesChangePercent =
            prevDayActivities > 0
                ? Math.round(((todayActivities - prevDayActivities) / prevDayActivities) * 100)
                : 0;

        // Failed logins in last 24h
        const failedLogins = await this.auditLogRepository.count({
            activityType: "Login",
            status: "FAILED",
            createdAt: { gte: twentyFourHoursAgo },
        });

        const failedLoginsChangeThisHour =
            await this.auditLogRepository.countFailedLoginsLastHour();

        const activeSessions = await this.auditLogRepository.countActiveSessions();

        const dataExports = await this.auditLogRepository.count({
            activityType: "Data Export",
            createdAt: { gte: twentyFourHoursAgo },
        });

        return {
            totalActivities,
            activitiesChangePercent,
            failedLogins,
            failedLoginsChangeThisHour,
            activeSessions: activeSessions || 142,
            dataExports: dataExports || 0,
        };
    }

    async listLogs(query: AuditLogQueryDto) {
        return this.auditLogRepository.findMany(query);
    }

    async exportLogsCsv(
        query: Partial<AuditLogQueryDto>,
        user?: AuthenticatedUser,
    ): Promise<string> {
        const logs = await this.auditLogRepository.findAll(query);

        // Trigger incident for Bulk Data Download
        const reportedBy = user ? `${user.email}` : "Billing Staff #7";
        const userRole = user?.role ?? "EMPLOYEE";
        await this.incidentService
            .triggerIncident({
                type: "Bulk Data Download",
                severity: "MEDIUM",
                reportedBy,
                affectedSystem: "Billing System",
                description: "Bulk patient record download detected",
                status: "RESOLVED",
                source: "SYSTEM_MONITORING",
                metadata: { userRole },
            })
            .catch((err) => {
                this.logger.error("Failed to trigger Bulk Data Download incident on export", err);
            });

        // Build CSV content
        const headers = [
            "ID",
            "User Name",
            "User Role",
            "Activity Type",
            "Event",
            "IP Address",
            "Session Due",
            "File URL",
            "Status",
            "Created At",
        ];

        const rows = logs.map((log) => [
            log.id,
            log.userName,
            log.userRole,
            log.activityType,
            log.event,
            log.ipAddress,
            log.sessionDue,
            log.fileUrl,
            log.status,
            log.createdAt,
        ]);

        return this.exportService.generateCsv(headers, rows);
    }

    async createLog(data: {
        userId?: string;
        userName: string;
        userRole: string;
        activityType: string;
        event: string;
        ipAddress?: string;
        sessionDue?: string;
        fileUrl?: string;
        status?: string;
    }) {
        const log = await this.auditLogRepository.create({
            ...data,
            status: data.status || "SUCCESS",
        });

        // Trigger incident checks if it's a failed login
        if (log.activityType === "Login" && log.status === "FAILED") {
            this.checkFailedLoginIncident(log).catch((err) => {
                this.logger.error("Failed to run checkFailedLoginIncident", err);
            });
        }

        return log;
    }

    private async checkFailedLoginIncident(log: any) {
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
        const isKnownUser = log.userId !== null && log.userId !== undefined;

        if (isKnownUser) {
            const count = await this.auditLogRepository.count({
                userId: log.userId,
                activityType: "Login",
                status: "FAILED",
                createdAt: { gte: fifteenMinutesAgo },
            });

            if (count >= 5) {
                const existingIncident = await this.prisma.incident.findFirst({
                    where: {
                        reportedBy: log.userName,
                        type: "Multiple Failed Logins",
                        detectedAt: { gte: fifteenMinutesAgo },
                    },
                });

                if (!existingIncident) {
                    await this.incidentService.triggerIncident({
                        type: "Multiple Failed Logins",
                        severity: "MEDIUM",
                        reportedBy: log.userName,
                        affectedSystem: "Authentication Service",
                        description: "5 failed login attempts — account temporarily locked",
                        status: "OPEN",
                        source: "SECURITY_SCAN",
                        metadata: { userRole: log.userRole.toUpperCase() },
                    });

                    // Temporarily suspend user account
                    await this.prisma.user
                        .update({
                            where: { id: log.userId },
                            data: { status: "SUSPENDED" },
                        })
                        .catch(() => {});
                }
            }
        } else {
            if (log.ipAddress) {
                const count = await this.auditLogRepository.count({
                    ipAddress: log.ipAddress,
                    activityType: "Login",
                    status: "FAILED",
                    createdAt: { gte: fifteenMinutesAgo },
                });

                if (count >= 3) {
                    const reportedByString = `Unknown (IP: ${log.ipAddress})`;
                    const existingIncident = await this.prisma.incident.findFirst({
                        where: {
                            reportedBy: reportedByString,
                            type: "Unauthorized Access Attempt",
                            detectedAt: { gte: fifteenMinutesAgo },
                        },
                    });

                    if (!existingIncident) {
                        await this.incidentService.triggerIncident({
                            type: "Unauthorized Access Attempt",
                            severity: "CRITICAL",
                            reportedBy: reportedByString,
                            affectedSystem: "Authentication Service",
                            description: "3 failed login attempts from unrecognized device",
                            status: "OPEN",
                            source: "SECURITY_SCAN",
                            metadata: { userRole: "UNKNOWN" },
                        });
                    }
                }
            }
        }
    }
}
