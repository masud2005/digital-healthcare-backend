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
        const { services, metrics, counts } = await this.systemHealthRepository.getSummary();
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
}
