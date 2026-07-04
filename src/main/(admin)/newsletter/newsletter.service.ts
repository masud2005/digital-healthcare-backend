import { Injectable } from "@nestjs/common";
import { PrismaService } from "@global/prisma/prisma.service";
import { NewsletterQueryDto } from "./dto/newsletter-query.dto";
import type { Prisma } from "@prisma/client";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

@Injectable()
export class NewsletterService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(query: NewsletterQueryDto) {
        const page = query.page ?? DEFAULT_PAGE;
        const limit = query.limit ?? DEFAULT_LIMIT;
        const search = query.search?.trim();

        const where: Prisma.NewsletterWhereInput = {};

        if (search) {
            where.email = {
                contains: search,
                mode: "insensitive",
            };
        }

        const [data, total] = await this.prisma.$transaction([
            this.prisma.newsletter.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            this.prisma.newsletter.count({ where }),
        ]);

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

    async getStats() {
        const now = new Date();
        const past24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const past7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const past30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const [total, count24h, count7d, count30d, pending, processing, completed, failed] =
            await this.prisma.$transaction([
                this.prisma.newsletter.count(),
                this.prisma.newsletter.count({
                    where: { createdAt: { gte: past24h } },
                }),
                this.prisma.newsletter.count({
                    where: { createdAt: { gte: past7d } },
                }),
                this.prisma.newsletter.count({
                    where: { createdAt: { gte: past30d } },
                }),
                this.prisma.mailQueue.count({ where: { status: "pending" } }),
                this.prisma.mailQueue.count({ where: { status: "processing" } }),
                this.prisma.mailQueue.count({ where: { status: "completed" } }),
                this.prisma.mailQueue.count({ where: { status: "failed" } }),
            ]);

        return {
            subscribers: {
                total,
                last24h: count24h,
                last7d: count7d,
                last30d: count30d,
            },
            mailQueue: {
                pending,
                processing,
                completed,
                failed,
            },
        };
    }

    async exportCsv(): Promise<string> {
        const subscribers = await this.prisma.newsletter.findMany({
            orderBy: { createdAt: "desc" },
        });

        const csvHeaders = "ID,Email,SubscribedAt\n";
        const csvRows = subscribers
            .map((sub) => {
                const escapedEmail = sub.email.replace(/"/g, '""');
                return `"${sub.id}","${escapedEmail}","${sub.createdAt.toISOString()}"`;
            })
            .join("\n");

        return csvHeaders + csvRows;
    }
}
