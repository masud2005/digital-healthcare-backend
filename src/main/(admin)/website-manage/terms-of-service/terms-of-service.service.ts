import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { UpdateTermsOfServiceDto } from "./dto/update-terms-of-service.dto";

@Injectable()
export class TermsOfServiceService {
    constructor(private readonly prisma: PrismaService) {}

    async get() {
        // Assume there's only one record for now, or get the first one
        let record = await this.prisma.termsOfService.findFirst();

        // If not found, you can return a default or error. We'll return an empty object or the newly created one.
        if (!record) {
            record = await this.prisma.termsOfService.create({
                data: { content: "<p>Default Terms of Service Content</p>" },
            });
        }

        return {
            success: true,
            message: "Terms of Service retrieved successfully",
            data: record,
        };
    }

    async update(dto: UpdateTermsOfServiceDto) {
        let record = await this.prisma.termsOfService.findFirst();

        if (!record) {
            record = await this.prisma.termsOfService.create({
                data: { content: dto.content || "" },
            });
        } else {
            record = await this.prisma.termsOfService.update({
                where: { id: record.id },
                data: dto,
            });
        }

        return {
            success: true,
            message: "Terms of Service updated successfully",
            data: record,
        };
    }
}
