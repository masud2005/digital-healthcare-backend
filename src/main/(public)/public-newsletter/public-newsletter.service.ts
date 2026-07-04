import { ConflictException, Injectable } from "@nestjs/common";
import { PrismaService } from "@global/prisma/prisma.service";
import { CreateNewsletterDto } from "./dto/create-newsletter.dto";

@Injectable()
export class PublicNewsletterService {
    constructor(private readonly prisma: PrismaService) {}

    async subscribe(payload: CreateNewsletterDto) {
        const email = payload.email.trim().toLowerCase();

        const existing = await this.prisma.newsletter.findUnique({
            where: { email },
        });

        if (existing) {
            throw new ConflictException("This email is already subscribed to our newsletter.");
        }

        await this.prisma.consent.create({
            data: {
                email,
                type: "MARKETING",
                status: "ACCEPTED",
                source: "WEB",
            },
        }).catch(() => {});

        return this.prisma.newsletter.create({
            data: { email },
        });
    }
}

