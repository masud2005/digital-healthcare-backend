import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { UpdatePrivacyPolicyDto } from "./dto/update-privacy-policy.dto";

@Injectable()
export class PrivacyPolicyService {
    constructor(private readonly prisma: PrismaService) {}

    async get() {
        // Assume there's only one record for now, or get the first one
        let record = await this.prisma.privacyPolicy.findFirst();

        // If not found, you can return a default or error. We'll return an empty object or the newly created one.
        if (!record) {
            record = await this.prisma.privacyPolicy.create({
                data: { content: "<p>Default Privacy Policy Content</p>" },
            });
        }

        return {
            success: true,
            message: "Privacy Policy retrieved successfully",
            data: record,
        };
    }

    async update(dto: UpdatePrivacyPolicyDto) {
        let record = await this.prisma.privacyPolicy.findFirst();

        if (!record) {
            record = await this.prisma.privacyPolicy.create({
                data: { content: dto.content || "" },
            });
        } else {
            record = await this.prisma.privacyPolicy.update({
                where: { id: record.id },
                data: dto,
            });
        }

        return {
            success: true,
            message: "Privacy Policy updated successfully",
            data: record,
        };
    }
}
