import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { AuditLogRepository } from "./audit-log.repository";
import { AuditLogQueryDto } from "./dto/audit-log-query.dto";
import { DEFAULT_AUDIT_LOGS, generateExtraLogs } from "./audit-log-seed.data";

@Injectable()
export class AuditLogService implements OnModuleInit {
    private readonly logger = new Logger(AuditLogService.name);

    constructor(private readonly auditLogRepository: AuditLogRepository) {}

    async onModuleInit() {
        await this.seedAuditLogs();
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
        const totalActivities = await this.auditLogRepository.count({});

        const failedLogins = await this.auditLogRepository.count({
            activityType: "Login",
            status: "FAILED",
        });

        const failedLoginsChangeThisHour = await this.auditLogRepository.countFailedLoginsLastHour();

        const activeSessions = await this.auditLogRepository.countActiveSessions();

        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const dataExports = await this.auditLogRepository.count({
            activityType: "Data Export",
            createdAt: { gte: twentyFourHoursAgo },
        });

        return {
            totalActivities,
            activitiesChangePercent: 12,
            failedLogins,
            failedLoginsChangeThisHour,
            activeSessions: activeSessions || 142,
            dataExports: dataExports || 142,
        };
    }

    async listLogs(query: AuditLogQueryDto) {
        return this.auditLogRepository.findMany(query);
    }

    async exportLogsCsv(query: Partial<AuditLogQueryDto>): Promise<string> {
        const logs = await this.auditLogRepository.findAll(query);

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

        const escapeCsvValue = (value: string | null | undefined): string => {
            if (value === null || value === undefined) return "";
            const str = String(value);
            // Wrap in quotes if contains comma, newline, or double-quote
            if (str.includes(",") || str.includes("\n") || str.includes('"')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const rows = logs.map((log) => [
            escapeCsvValue(log.id),
            escapeCsvValue(log.userName),
            escapeCsvValue(log.userRole),
            escapeCsvValue(log.activityType),
            escapeCsvValue(log.event),
            escapeCsvValue(log.ipAddress),
            escapeCsvValue(log.sessionDue),
            escapeCsvValue(log.fileUrl),
            escapeCsvValue(log.status),
            escapeCsvValue(log.createdAt.toISOString()),
        ]);

        const csvLines = [headers.join(","), ...rows.map((row) => row.join(","))];
        return csvLines.join("\n");
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
        return this.auditLogRepository.create({
            ...data,
            status: data.status || "SUCCESS",
        });
    }
}
