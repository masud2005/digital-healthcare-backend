import { Injectable } from "@nestjs/common";
import { PrismaService } from "@global/prisma/prisma.service";
import { AuditLogRepository } from "../audit-log/audit-log.repository";
import { ConsentRepository } from "../consent/consent.repository";
import { ProviderLicenseRepository } from "../provider-license/provider-license.repository";

@Injectable()
export class ComplianceDashboardService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly auditLogRepository: AuditLogRepository,
        private readonly consentRepository: ConsentRepository,
        private readonly providerLicenseRepository: ProviderLicenseRepository,
    ) {}

    async getDashboard() {
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const yesterday = new Date(now.getTime() - 48 * 60 * 60 * 1000);

        // --- Run all queries in parallel ---
        const [
            auditLog24hCount,
            failedLogins24h,
            failedLoginsYesterday,
            totalUsers,
            usersWithAcceptedConsent,
            openIncidents,
            totalActiveUsers,
            mfaEnabledUsers,
            licenseStats,
            recentAlerts,
        ] = await Promise.all([
            // Audit log count (last 24h)
            this.auditLogRepository.count({ createdAt: { gte: twentyFourHoursAgo } }),

            // Failed logins last 24h
            this.auditLogRepository.count({
                activityType: "Login",
                status: "FAILED",
                createdAt: { gte: twentyFourHoursAgo },
            }),

            // Failed logins in the prior 24h window (for delta label)
            this.auditLogRepository.count({
                activityType: "Login",
                status: "FAILED",
                createdAt: { gte: yesterday, lte: twentyFourHoursAgo },
            }),

            // Total active users
            this.prisma.user.count({ where: { status: "ACTIVE" } }),

            // Users with at least one ACCEPTED consent
            this.prisma.consent
                .groupBy({
                    by: ["userId"],
                    where: { status: "ACCEPTED", userId: { not: null } },
                })
                .then((rows) => rows.length),

            // Open + investigating incidents count
            this.prisma.incident.count({
                where: { isActive: true, status: { in: ["OPEN", "INVESTIGATING"] } },
            }),

            // Total active users (reused for MFA calc)
            this.prisma.user.count({ where: { status: "ACTIVE" } }),

            // Users with MFA enabled
            this.prisma.user.count({ where: { status: "ACTIVE", mfaEnabled: true } }),

            // Provider license stats
            this.providerLicenseRepository.getStats(),

            // Latest open/investigating incidents for the Security & Risk Alerts panel
            this.prisma.incident.findMany({
                where: { isActive: true, status: { in: ["OPEN", "INVESTIGATING"] } },
                orderBy: { detectedAt: "desc" },
                take: 6,
            }),
        ]);

        // --- Derived calculations ---
        const failedLoginsDelta = failedLogins24h - failedLoginsYesterday;

        const consentPercent =
            totalUsers > 0 ? Math.round((usersWithAcceptedConsent / totalUsers) * 100) : 0;

        const mfaPercent =
            totalActiveUsers > 0 ? Math.round((mfaEnabledUsers / totalActiveUsers) * 100) : 0;

        // HIPAA readiness: weighted composite score
        // - Consent coverage (30%)
        // - MFA adoption (25%)
        // - Audit trail active (20%)
        // - License compliance rate (25%)
        const auditTrailScore = auditLog24hCount > 0 ? 100 : 0;
        const licenseComplianceScore =
            licenseStats.total > 0
                ? Math.round((licenseStats.active / licenseStats.total) * 100)
                : 100;

        const hipaaScore = Math.round(
            consentPercent * 0.3 +
                mfaPercent * 0.25 +
                auditTrailScore * 0.2 +
                licenseComplianceScore * 0.25,
        );

        const dataRetentionPercent = 100;

        const auditTrailCoveragePercent = Math.min(
            100,
            auditLog24hCount > 500 ? 98 : auditLog24hCount > 100 ? 90 : 75,
        );

        return {
            hipaaCompliance: {
                value: hipaaScore,
                unit: "%",
                label: "Readiness score",
            },
            consentCompletion: {
                value: consentPercent,
                unit: "%",
                label: "Of active patients",
            },
            securityAlerts: {
                value: openIncidents,
                unit: "alerts",
                label: "Active right now",
            },
            failedLogins24h: {
                value: failedLogins24h,
                unit: "attempts",
                label:
                    failedLoginsDelta >= 0
                        ? `+${failedLoginsDelta} from yesterday`
                        : `${failedLoginsDelta} from yesterday`,
            },
            mfaAdoption: {
                value: mfaPercent,
                unit: "%",
                label: "Staff coverage",
            },
            auditLog24h: {
                value: auditLog24hCount,
                unit: "events",
                label: "Events logged",
            },
            recentAlerts: recentAlerts.map((incident) => ({
                id: incident.id,
                incidentId: incident.incidentId,
                type: incident.type,
                severity: incident.severity,
                status: incident.status,
                reportedBy: incident.reportedBy,
                description: incident.description,
                detectedAt: incident.detectedAt,
            })),
            complianceStatus: [
                {
                    name: "HIPAA Readiness Score",
                    status:
                        hipaaScore >= 85
                            ? "Compliant"
                            : hipaaScore >= 70
                              ? "Active"
                              : "Needs Review",
                    percent: hipaaScore,
                    statusCode:
                        hipaaScore >= 85
                            ? "COMPLIANT"
                            : hipaaScore >= 70
                              ? "ACTIVE"
                              : "NEEDS_REVIEW",
                },
                {
                    name: "Data Retention Policy",
                    status: "Active",
                    percent: dataRetentionPercent,
                    statusCode: "ACTIVE",
                },
                {
                    name: "Consent Coverage",
                    status: consentPercent >= 85 ? "Active" : "Needs Review",
                    percent: consentPercent,
                    statusCode: consentPercent >= 85 ? "ACTIVE" : "NEEDS_REVIEW",
                },
                {
                    name: "MFA Enforcement",
                    status: mfaPercent >= 80 ? "Active" : "Needs Review",
                    percent: mfaPercent,
                    statusCode: mfaPercent >= 80 ? "ACTIVE" : "NEEDS_REVIEW",
                },
                {
                    name: "Audit Trail Coverage",
                    status: "Active",
                    percent: auditTrailCoveragePercent,
                    statusCode: "ACTIVE",
                },
            ],
        };
    }
}
