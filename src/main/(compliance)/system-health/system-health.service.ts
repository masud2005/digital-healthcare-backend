import type { SystemHealthStatus } from "@constant/enums";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { SystemHealthMetricQueryDto } from "./dto/system-health-metric-query.dto";
import { SystemHealthQueryDto } from "./dto/system-health-query.dto";
import { SystemHealthRepository } from "./system-health.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

@Injectable()
export class SystemHealthService {
    constructor(private readonly systemHealthRepository: SystemHealthRepository) {}

    async getOverview() {
        const startTime = Date.now();
        const { services, metrics, counts } = await this.systemHealthRepository.getSummary();
        const dbDuration = Date.now() - startTime;

        // Record database latency to logs
        this.recordDatabaseQuery(dbDuration).catch(() => {});

        // Dynamically update database health card in memory for current response
        const dbService = services.find(s => s.key === "database_health");
        if (dbService) {
            dbService.responseTimeMs = dbDuration;
            if (dbDuration > 100) {
                dbService.status = "DEGRADED";
                dbService.message = `High database response times detected: ${dbDuration}ms`;
            } else {
                dbService.status = "OPERATIONAL";
                dbService.message = "Database operating normally";
            }
        }

        const totals = this.buildStatusCounts(counts);

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
            status: isError ? "DEGRADED" : "OPERATIONAL",
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
            { outageUptime: 95, degradedUptime: 98, degradedLatency: 1000 },
            {
                operational: "Email delivery operating normally",
                outage: (upt) => `SendGrid delivery experiencing high failure rate: ${upt.toFixed(1)}%`,
                degraded: (lat) => `Delays detected with SendGrid delivery - avg ${(lat / 1000).toFixed(1)}s latency`,
            },
        );
    }

    private async recalculateSmsDeliveryHealth() {
        await this.recalculateService(
            "sms_delivery",
            { outageUptime: 95, degradedUptime: 99, degradedLatency: 1000 },
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

        const failedCount = logs.filter(l => l.status === "DEGRADED").length;
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
        const logs = await this.systemHealthRepository.getLogsSince("http_requests", fiveMinutesAgo);

        // Requests per minute: count of logs in the last 1 minute
        const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
        const reqsInLastMin = logs.filter(l => l.createdAt >= oneMinuteAgo).length;

        // Avg response time and error rate over last 5 minutes
        let avgResponse = 0;
        let errorRate = 0;

        if (logs.length > 0) {
            const responseTimes = logs.filter(l => l.responseTimeMs !== null).map(l => l.responseTimeMs as number);
            avgResponse = responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0;
            const errorLogs = logs.filter(l => l.status === "DEGRADED").length;
            errorRate = (errorLogs / logs.length) * 100;
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

    private calculateAggregates(logs: Array<{ status: SystemHealthStatus; responseTimeMs: number | null }>) {
        const validResponses = logs.filter(l => l.responseTimeMs !== null).map(l => l.responseTimeMs as number);
        const avgResponse = validResponses.length > 0 ? validResponses.reduce((a, b) => a + b, 0) / validResponses.length : 0;
        
        // Uptime calculated as the percentage of checks that did not result in an OUTAGE
        const outageCount = logs.filter(l => l.status === "OUTAGE").length;
        const uptime = logs.length > 0 ? ((logs.length - outageCount) / logs.length) * 100 : 100;

        return { avgResponse, uptime };
    }
}
