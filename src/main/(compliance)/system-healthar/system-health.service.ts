import * as os from "os";
import * as fs from "fs";
import type { SystemHealthStatus } from "@constant/enums";
import { BadRequestException, Injectable, Logger, NotFoundException, OnModuleInit } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { SystemHealthMetricQueryDto } from "./dto/system-health-metric-query.dto";
import { SystemHealthQueryDto } from "./dto/system-health-query.dto";
import { SystemHealthRepository } from "./system-health.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

// Default service definitions — seeded on startup if not present in DB
const DEFAULT_SERVICES: Array<{
    key: string;
    name: string;
    category: string;
    status: SystemHealthStatus;
    description: string;
    responseTimeMs: number | null;
    uptimePercent: number;
    message: string;
}> = [
    {
        key: "server_status",
        name: "Server Status",
        category: "Infrastructure",
        status: "OPERATIONAL",
        description: "Core application server availability",
        responseTimeMs: null,
        uptimePercent: 100,
        message: "Initialising — awaiting first request",
    },
    {
        key: "email_delivery",
        name: "Email Delivery",
        category: "Third Party",
        status: "OPERATIONAL",
        description: "Transactional email sending performance",
        responseTimeMs: null,
        uptimePercent: 100,
        message: "Initialising — awaiting first email",
    },
    {
        key: "sms_delivery",
        name: "SMS Delivery",
        category: "Third Party",
        status: "OPERATIONAL",
        description: "Two-factor authentication and notification SMS delivery",
        responseTimeMs: null,
        uptimePercent: 100,
        message: "Initialising — awaiting first SMS",
    },
    {
        key: "payment_gateway",
        name: "Payment Gateway",
        category: "Third Party",
        status: "OPERATIONAL",
        description: "Stripe processing gateway availability",
        responseTimeMs: null,
        uptimePercent: 100,
        message: "Initialising — awaiting first payment",
    },
    {
        key: "database_health",
        name: "Database Health",
        category: "Infrastructure",
        status: "OPERATIONAL",
        description: "PostgreSQL database performance and connection pool",
        responseTimeMs: null,
        uptimePercent: 100,
        message: "Initialising — awaiting first query",
    },
    {
        key: "login_error_rate",
        name: "Login Error Rate",
        category: "Authentication",
        status: "OPERATIONAL",
        description: "Failed login attempts rate monitoring",
        responseTimeMs: null,
        uptimePercent: 100,
        message: "Initialising — awaiting first login attempt",
    },
];

// Default metric definitions — seeded on startup if not present in DB
const DEFAULT_METRICS: Array<{
    key: string;
    label: string;
    value: number;
    unit: string | null;
    displayValue: string;
}> = [
    { key: "requests_per_min", label: "Requests/min", value: 0, unit: null, displayValue: "0" },
    { key: "avg_response_time", label: "Avg Response", value: 0, unit: "ms", displayValue: "0ms" },
    { key: "error_rate", label: "Error Rate", value: 0, unit: "%", displayValue: "0%" },
    { key: "active_users", label: "Active Users", value: 0, unit: null, displayValue: "0" },
    { key: "queue_depth", label: "Queue Depth", value: 0, unit: null, displayValue: "0" },
    { key: "cpu_usage", label: "CPU Usage", value: 0, unit: "%", displayValue: "0%" },
    { key: "memory_usage", label: "Memory", value: 0, unit: "%", displayValue: "0%" },
    { key: "disk_io", label: "Disk I/O", value: 0, unit: "%", displayValue: "0%" },
];

@Injectable()
export class SystemHealthService implements OnModuleInit {
    private readonly logger = new Logger(SystemHealthService.name);

    constructor(private readonly systemHealthRepository: SystemHealthRepository) {}

    async onModuleInit() {
        try {
            await Promise.all([
                ...DEFAULT_SERVICES.map((s) => this.systemHealthRepository.upsertService(s)),
                ...DEFAULT_METRICS.map((m) =>
                    this.systemHealthRepository.upsertMetricValue(
                        m.key,
                        m.label,
                        m.value,
                        m.unit,
                        m.displayValue,
                    ),
                ),
            ]);
            this.logger.log("SystemHealth: default service and metric rows seeded");

            // Verify configuration status of third-party delivery integrations
            const smtpHost = process.env.SMTP_HOST?.trim();
            const smtpUser = process.env.SMTP_USER?.trim();
            const smtpPass = process.env.SMTP_PASS;
            if (!smtpHost || !smtpUser || !smtpPass) {
                await this.systemHealthRepository.updateServiceHealth("email_delivery", {
                    status: "OUTAGE",
                    message: "Email provider is not configured. Missing SMTP host, user or password credentials.",
                });
            }

            const twilioSid = process.env.TWILIO_ACCOUNT_SID;
            const twilioToken = process.env.TWILIO_AUTH_TOKEN;
            const twilioFrom = process.env.TWILIO_FROM_NUMBER ?? process.env.TWILIO_PHONE_NUMBER;
            if (!twilioSid || !twilioToken || !twilioFrom) {
                await this.systemHealthRepository.updateServiceHealth("sms_delivery", {
                    status: "OUTAGE",
                    message: "SMS gateway is not configured. Missing Twilio SID, token or sender number.",
                });
            }
        } catch (err) {
            this.logger.error("SystemHealth: failed to seed default rows", err);
        }

        // Immediately collect OS metrics once on startup
        await this.collectSystemMetrics().catch(() => {});
    }

    /**
     * Cron job — runs every 30 seconds to sample real OS + DB metrics
     * and persist them so the dashboard always shows live data.
     */
    @Cron(CronExpression.EVERY_30_SECONDS)
    async collectSystemMetrics() {
        try {
            const [cpuPercent, memPercent, diskPercent, activeUsers, pendingSubmissions] = await Promise.all([
                this.getCpuUsagePercent(),
                this.getMemoryUsagePercent(),
                this.getDiskUsagePercent(),
                this.systemHealthRepository.countActiveUsers(),
                this.systemHealthRepository.countPendingSubmissions(),
            ]);

            await Promise.all([
                this.updateSystemMetric("cpu_usage", cpuPercent),
                this.updateSystemMetric("memory_usage", memPercent),
                this.updateSystemMetric("disk_io", diskPercent),
                this.systemHealthRepository.upsertMetricValue(
                    "active_users",
                    "Active Users",
                    activeUsers,
                    null,
                    activeUsers.toLocaleString(),
                ),
                this.systemHealthRepository.upsertMetricValue(
                    "queue_depth",
                    "Queue Depth",
                    pendingSubmissions,
                    null,
                    pendingSubmissions.toLocaleString(),
                ),
            ]);
        } catch (err) {
            this.logger.warn("SystemHealth: failed to collect system metrics", err);
        }
    }

    /**
     * Returns the full system health overview — services + metrics — read directly from DB.
     * Also performs a live DB ping for the `database_health` service and records it.
     */
    async getOverview() {
        // Live DB ping — records latency and updates database_health row
        const dbStart = Date.now();
        await this.systemHealthRepository.getLogs("database_health", 1).catch(() => {});
        const dbDuration = Date.now() - dbStart;
        this.recordDatabaseQuery(dbDuration).catch(() => {});

        // Read everything from DB
        const { services, metrics, counts } = await this.systemHealthRepository.getSummary();

        const totals = this.buildStatusCounts(counts as any);

        return {
            title:
                totals.down > 0
                    ? "Some Services Down"
                    : totals.degraded > 0
                      ? "Some Services Degraded"
                      : "All Systems Operational",
            counts: totals,
            services,
            metrics,
        };
    }

    async findAll(query: SystemHealthQueryDto) {
        const page = query.page ?? DEFAULT_PAGE;
        const limit = query.limit ?? DEFAULT_LIMIT;

        const { data, total } = await this.systemHealthRepository.findAll({
            page,
            limit,
            search: query.search?.trim(),
            category: query.category?.trim(),
            status: query.status,
            isActive: query.isActive,
            checkedFrom: this.parseQueryDate(query.checkedFrom, "checkedFrom"),
            checkedTo: this.parseQueryDate(query.checkedTo, "checkedTo"),
        });

        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const systemHealth = await this.systemHealthRepository.findById(id);

        if (!systemHealth) {
            throw new NotFoundException("System health record not found");
        }

        return systemHealth;
    }

    async findAllMetrics(query: SystemHealthMetricQueryDto) {
        const page = query.page ?? DEFAULT_PAGE;
        const limit = query.limit ?? DEFAULT_LIMIT;

        const { data, total } = await this.systemHealthRepository.findAllMetrics({
            page,
            limit,
            search: query.search?.trim(),
            isActive: query.isActive,
        });

        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOneMetric(id: string) {
        const metric = await this.systemHealthRepository.findMetricById(id);

        if (!metric) {
            throw new NotFoundException("System health metric not found");
        }

        return metric;
    }

    private parseQueryDate(value: string | undefined, fieldName: string) {
        if (!value) {
            return undefined;
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            throw new BadRequestException(`${fieldName} must be a valid date`);
        }

        return date;
    }

    private buildStatusCounts(
        rows: Array<{ status: SystemHealthStatus; _count?: true | { _all?: number } }>,
    ) {
        const counts = {
            total: 0,
            operational: 0,
            degraded: 0,
            down: 0,
            maintenance: 0,
        };

        for (const row of rows) {
            const count = typeof row._count === "object" ? (row._count._all ?? 0) : 0;
            counts.total += count;

            if (row.status === "OPERATIONAL") {
                counts.operational = count;
            }

            if (row.status === "DEGRADED") {
                counts.degraded = count;
            }

            if (row.status === "OUTAGE") {
                counts.down = count;
            }

            if (row.status === "MAINTENANCE") {
                counts.maintenance = count;
            }
        }

        return counts;
    }

    // --- System Health Bridge / Channel Functions ---

    /**
     * Records a server availability check and response latency.
     */
    async recordServerStatus(success: boolean, responseTimeMs: number) {
        await this.systemHealthRepository.createLog({
            systemKey: "server_status",
            status: success ? "OPERATIONAL" : "OUTAGE",
            responseTimeMs,
        });
        await this.recalculateServerStatus();
    }

    /**
     * Records an email delivery attempt and latency.
     */
    async recordEmailDelivery(success: boolean, responseTimeMs: number) {
        await this.systemHealthRepository.createLog({
            systemKey: "email_delivery",
            status: success ? "OPERATIONAL" : "OUTAGE",
            responseTimeMs,
        });
        await this.recalculateEmailDeliveryHealth();
    }

    /**
     * Records an SMS delivery attempt and latency.
     */
    async recordSmsDelivery(success: boolean, responseTimeMs: number) {
        await this.systemHealthRepository.createLog({
            systemKey: "sms_delivery",
            status: success ? "OPERATIONAL" : "OUTAGE",
            responseTimeMs,
        });
        await this.recalculateSmsDeliveryHealth();
    }

    /**
     * Records a payment processing attempt and latency.
     */
    async recordPaymentAttempt(success: boolean, responseTimeMs: number) {
        await this.systemHealthRepository.createLog({
            systemKey: "payment_gateway",
            status: success ? "OPERATIONAL" : "OUTAGE",
            responseTimeMs,
        });
        await this.recalculatePaymentGatewayHealth();
    }

    /**
     * Records database query latency.
     */
    async recordDatabaseQuery(responseTimeMs: number) {
        const isHealthy = responseTimeMs < 500; // threshold
        await this.systemHealthRepository.createLog({
            systemKey: "database_health",
            status: isHealthy ? "OPERATIONAL" : "DEGRADED",
            responseTimeMs,
        });
        await this.recalculateDatabaseHealth();
    }

    /**
     * Records a login attempt. Failed logins are treated as degraded events.
     */
    async recordLoginAttempt(success: boolean) {
        await this.systemHealthRepository.createLog({
            systemKey: "login_error_rate",
            status: success ? "OPERATIONAL" : "DEGRADED",
        });
        await this.recalculateLoginErrorRateHealth();
    }

    /**
     * Records a generic HTTP request to track volume, latency, and errors.
     */
    async recordHttpRequest(responseTimeMs: number, isError: boolean) {
        await this.systemHealthRepository.createLog({
            systemKey: "http_requests",
            status: isError ? "OUTAGE" : "OPERATIONAL",
            responseTimeMs,
        });
        await this.recalculateHttpMetrics();
    }

    /**
     * Directly updates a systemic metric value (e.g. CPU, Memory).
     */
    async updateSystemMetric(key: string, value: number) {
        let label = key;
        let unit: string | null = null;
        let displayValue = `${value}`;

        if (key === "cpu_usage") {
            label = "CPU Usage";
            unit = "%";
            displayValue = `${Math.round(value)}%`;
        } else if (key === "memory_usage") {
            label = "Memory";
            unit = "%";
            displayValue = `${Math.round(value)}%`;
        } else if (key === "disk_io") {
            label = "Disk I/O";
            unit = "%";
            displayValue = `${Math.round(value)}%`;
        } else if (key === "active_users") {
            label = "Active Users";
            displayValue = value.toLocaleString();
        } else if (key === "queue_depth") {
            label = "Queue Depth";
            displayValue = value.toLocaleString();
        }

        await this.systemHealthRepository.upsertMetricValue(key, label, value, unit, displayValue);
    }

    // --- OS Metric Collectors ---

    /**
     * Samples CPU usage by comparing idle and total ticks across a 100ms interval.
     */
    private getCpuUsagePercent(): Promise<number> {
        return new Promise((resolve) => {
            const cpusBefore = os.cpus();

            setTimeout(() => {
                const cpusAfter = os.cpus();
                let totalIdle = 0;
                let totalTick = 0;

                for (let i = 0; i < cpusBefore.length; i++) {
                    const before = cpusBefore[i].times;
                    const after = cpusAfter[i].times;

                    const idle = after.idle - before.idle;
                    const total =
                        (after.user - before.user) +
                        (after.nice - before.nice) +
                        (after.sys - before.sys) +
                        (after.irq - before.irq) +
                        idle;

                    totalIdle += idle;
                    totalTick += total;
                }

                const usagePercent = totalTick > 0 ? ((totalTick - totalIdle) / totalTick) * 100 : 0;
                resolve(parseFloat(usagePercent.toFixed(1)));
            }, 100);
        });
    }

    /**
     * Returns memory usage as a percentage of total RAM.
     */
    private getMemoryUsagePercent(): number {
        const total = os.totalmem();
        const free = os.freemem();
        return parseFloat(((1 - free / total) * 100).toFixed(1));
    }

    /**
     * Returns disk space usage % for the root volume using fs.statfs (Node 18+).
     * Falls back to 0 if the API is unavailable.
     */
    private getDiskUsagePercent(): Promise<number> {
        return new Promise((resolve) => {
            try {
                // fs.statfs is available from Node.js 18.15+
                (fs as any).statfs("/", (err: NodeJS.ErrnoException | null, stats: any) => {
                    if (err || !stats) {
                        resolve(0);
                        return;
                    }
                    const total = stats.blocks * stats.bsize;
                    const free = stats.bfree * stats.bsize;
                    const used = total - free;
                    const percent = total > 0 ? (used / total) * 100 : 0;
                    resolve(parseFloat(percent.toFixed(1)));
                });
            } catch {
                resolve(0);
            }
        });
    }

    // --- Recalculation Helpers ---

    private async recalculateService(
        key: string,
        thresholds: {
            outageUptime: number;
            degradedUptime: number;
            degradedLatency: number;
        },
        messageGenerators: {
            operational: string;
            outage: (uptime: number) => string;
            degraded: (latency: number, uptime: number) => string;
        },
    ) {
        const logs = await this.systemHealthRepository.getLogs(key, 100);
        if (logs.length === 0) return;

        const { avgResponse, uptime } = this.calculateAggregates(logs);
        let status: SystemHealthStatus = "OPERATIONAL";
        let message = messageGenerators.operational;

        if (uptime < thresholds.outageUptime) {
            status = "OUTAGE";
            message = messageGenerators.outage(uptime);
        } else if (uptime < thresholds.degradedUptime || avgResponse > thresholds.degradedLatency) {
            status = "DEGRADED";
            message = messageGenerators.degraded(avgResponse, uptime);
        }

        await this.systemHealthRepository.updateServiceHealth(key, {
            status,
            responseTimeMs: Math.round(avgResponse),
            uptimePercent: parseFloat(uptime.toFixed(2)),
            message,
        });
    }

    private async recalculateServerStatus() {
        await this.recalculateService(
            "server_status",
            { outageUptime: 95, degradedUptime: 99, degradedLatency: 500 },
            {
                operational: "Server operating normally",
                outage: () => "Server experiencing high failure rates",
                degraded: (lat) => `Server response latency is high: ${Math.round(lat)}ms`,
            },
        );
    }

    private async recalculateEmailDeliveryHealth() {
        await this.recalculateService(
            "email_delivery",
            { outageUptime: 95, degradedUptime: 98, degradedLatency: 5000 },
            {
                operational: "Email delivery operating normally",
                outage: (upt) =>
                    `SendGrid delivery experiencing high failure rate: ${upt.toFixed(1)}%`,
                degraded: (lat) =>
                    `Delays detected with SendGrid delivery - avg ${(lat / 1000).toFixed(1)}s latency`,
            },
        );
    }

    private async recalculateSmsDeliveryHealth() {
        await this.recalculateService(
            "sms_delivery",
            { outageUptime: 95, degradedUptime: 99, degradedLatency: 5000 },
            {
                operational: "SMS gateway operating normally",
                outage: () => "SMS gateway experiencing high failure rate",
                degraded: (lat) => `SMS gateway latency is high: ${(lat / 1000).toFixed(1)}s`,
            },
        );
    }

    private async recalculatePaymentGatewayHealth() {
        await this.recalculateService(
            "payment_gateway",
            { outageUptime: 95, degradedUptime: 99, degradedLatency: 2000 },
            {
                operational: "Payment gateway operating normally",
                outage: () => "Stripe API experiencing outages",
                degraded: () => "Stripe API response times are degraded",
            },
        );
    }

    private async recalculateDatabaseHealth() {
        await this.recalculateService(
            "database_health",
            { outageUptime: 99, degradedUptime: 99, degradedLatency: 100 },
            {
                operational: "Database operating normally",
                outage: () => "Database connection issues detected",
                degraded: (lat) => `High database response times detected: ${Math.round(lat)}ms`,
            },
        );
    }

    private async recalculateLoginErrorRateHealth() {
        const logs = await this.systemHealthRepository.getLogs("login_error_rate", 100);
        if (logs.length === 0) return;

        const failedCount = logs.filter((l) => l.status === "DEGRADED").length;
        const errorRate = (failedCount / logs.length) * 100;

        let status: SystemHealthStatus = "OPERATIONAL";
        let message = "Login error rate within normal parameters.";

        if (errorRate > 2) {
            status = "DEGRADED";
            message = `Login error rate at ${errorRate.toFixed(1)}% - above 2% threshold. Spike started recently.`;
        }

        await this.systemHealthRepository.updateServiceHealth("login_error_rate", {
            status,
            responseTimeMs: null,
            uptimePercent: parseFloat((100 - errorRate).toFixed(2)),
            message,
        });
    }

    private async recalculateHttpMetrics() {
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
        const logs = await this.systemHealthRepository.getLogsSince(
            "http_requests",
            fiveMinutesAgo,
        );

        // Requests per minute: count of logs in the last 1 minute
        const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
        const reqsInLastMin = logs.filter((l) => l.createdAt >= oneMinuteAgo).length;

        // Avg response time and error rate over last 5 minutes
        let avgResponse = 0;
        let errorRate = 0;

        if (logs.length > 0) {
            const responseTimes = logs
                .filter((l) => l.responseTimeMs !== null)
                .map((l) => l.responseTimeMs as number);
            avgResponse =
                responseTimes.length > 0
                    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
                    : 0;
            const systemErrorLogs = logs.filter((l) => l.status === "OUTAGE").length;
            errorRate = (systemErrorLogs / logs.length) * 100;
        }

        await this.systemHealthRepository.upsertMetricValue(
            "requests_per_min",
            "Requests/min",
            reqsInLastMin,
            null,
            reqsInLastMin.toLocaleString(),
        );

        await this.systemHealthRepository.upsertMetricValue(
            "avg_response_time",
            "Avg Response",
            avgResponse,
            "ms",
            `${Math.round(avgResponse)}ms`,
        );

        await this.systemHealthRepository.upsertMetricValue(
            "error_rate",
            "Error Rate",
            errorRate,
            "%",
            `${errorRate.toFixed(1)}%`,
        );
    }

    private calculateAggregates(
        logs: Array<{ status: SystemHealthStatus; responseTimeMs: number | null }>,
    ) {
        const validResponses = logs
            .filter((l) => l.responseTimeMs !== null)
            .map((l) => l.responseTimeMs as number);
        const avgResponse =
            validResponses.length > 0
                ? validResponses.reduce((a, b) => a + b, 0) / validResponses.length
                : 0;

        // Uptime calculated as the percentage of checks that did not result in an OUTAGE
        const outageCount = logs.filter((l) => l.status === "OUTAGE").length;
        const uptime = logs.length > 0 ? ((logs.length - outageCount) / logs.length) * 100 : 100;

        return { avgResponse, uptime };
    }
}
