import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { UpdateCoverageSectionDto } from "./dto/update-coverage-section.dto";

@Injectable()
export class CoverageSectionService {
    constructor(private readonly prisma: PrismaService) {}

    async get() {
        let record = await this.prisma.coverageSection.findFirst();

        if (!record) {
            record = await this.prisma.coverageSection.create({
                data: {
                    title: "Default Coverage Section Title",
                    description: "Default Coverage Section Description",
                },
            });
        }

        return {
            success: true,
            message: "Coverage Section retrieved successfully",
            data: record,
        };
    }

    async update(dto: UpdateCoverageSectionDto) {
        let record = await this.prisma.coverageSection.findFirst();

        if (!record) {
            record = await this.prisma.coverageSection.create({
                data: {
                    title: dto.title || "Default Coverage Section Title",
                    description: dto.description || "Default Coverage Section Description",
                },
            });
        } else {
            record = await this.prisma.coverageSection.update({
                where: { id: record.id },
                data: dto,
            });
        }

        return {
            success: true,
            message: "Coverage Section updated successfully",
            data: record,
        };
    }
}
