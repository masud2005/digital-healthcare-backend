import { PrismaClient } from "@prisma/client";

const services = [
    {
        key: "server_status",
        name: "Server Status",
        category: "Infrastructure",
        status: "OPERATIONAL" as const,
        description: "Core application server availability",
        responseTimeMs: 42,
        uptimePercent: 99.98,
        message: "Server operating normally",
    },
    {
        key: "email_delivery",
        name: "Email Delivery",
        category: "Third Party",
        status: "DEGRADED" as const,
        description: "Transactional email sending performance",
        responseTimeMs: 1200,
        uptimePercent: 97.4,
        message: "Delays detected with SendGrid delivery - avg 1.2s latency",
    },
    {
        key: "sms_delivery",
        name: "SMS Delivery",
        category: "Third Party",
        status: "OPERATIONAL" as const,
        description: "Two-factor authentication and notification SMS delivery",
        responseTimeMs: 340,
        uptimePercent: 99.9,
        message: "SMS gateway operating normally",
    },
    {
        key: "payment_gateway",
        name: "Payment Gateway",
        category: "Third Party",
        status: "OPERATIONAL" as const,
        description: "Stripe processing gateway availability",
        responseTimeMs: 210,
        uptimePercent: 100.0,
        message: "Payment gateway operating normally",
    },
    {
        key: "database_health",
        name: "Database Health",
        category: "Infrastructure",
        status: "OPERATIONAL" as const,
        description: "PostgreSQL database performance and connection pool",
        responseTimeMs: 18,
        uptimePercent: 99.99,
        message: "Database operating normally",
    },
    {
        key: "login_error_rate",
        name: "Login Error Rate",
        category: "Authentication",
        status: "DEGRADED" as const,
        description: "Failed login attempts rate monitoring",
        responseTimeMs: null,
        uptimePercent: 95.8,
        message: "Login error rate at 4.2% - above 2% threshold. Spike started 15 mins ago.",
    },
];

const metrics = [
    {
        key: "requests_per_min",
        label: "Requests/min",
        value: 1847,
        unit: null,
        displayValue: "1,847",
    },
    {
        key: "avg_response_time",
        label: "Avg Response",
        value: 124,
        unit: "ms",
        displayValue: "124ms",
    },
    {
        key: "error_rate",
        label: "Error Rate",
        value: 0.3,
        unit: "%",
        displayValue: "0.3%",
    },
    {
        key: "active_users",
        label: "Active Users",
        value: 142,
        unit: null,
        displayValue: "142",
    },
    {
        key: "queue_depth",
        label: "Queue Depth",
        value: 23,
        unit: null,
        displayValue: "23",
    },
    {
        key: "cpu_usage",
        label: "CPU Usage",
        value: 34,
        unit: "%",
        displayValue: "34%",
    },
    {
        key: "memory_usage",
        label: "Memory",
        value: 61,
        unit: "%",
        displayValue: "61%",
    },
    {
        key: "disk_io",
        label: "Disk I/O",
        value: 12,
        unit: "%",
        displayValue: "12%",
    },
];

export async function systemHealthSeed(prisma: PrismaClient) {
    console.log("🌱 Seeding System Health Services...");
    for (const service of services) {
        await prisma.systemHealth.upsert({
            where: { key: service.key },
            update: {
                name: service.name,
                category: service.category,
                status: service.status,
                description: service.description,
                responseTimeMs: service.responseTimeMs,
                uptimePercent: service.uptimePercent,
                message: service.message,
                isActive: true,
            },
            create: {
                key: service.key,
                name: service.name,
                category: service.category,
                status: service.status,
                description: service.description,
                responseTimeMs: service.responseTimeMs,
                uptimePercent: service.uptimePercent,
                message: service.message,
                isActive: true,
            },
        });
    }

    console.log("🌱 Seeding System Health Metrics...");
    for (const metric of metrics) {
        await prisma.systemHealthMetric.upsert({
            where: { key: metric.key },
            update: {
                label: metric.label,
                value: metric.value,
                unit: metric.unit,
                displayValue: metric.displayValue,
                isActive: true,
            },
            create: {
                key: metric.key,
                label: metric.label,
                value: metric.value,
                unit: metric.unit,
                displayValue: metric.displayValue,
                isActive: true,
            },
        });
    }

    console.log("✅ System Health Seed Completed.");
}
