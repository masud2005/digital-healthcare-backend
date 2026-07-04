import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { UpdateMedicalTeamSectionDto } from "./dto/update-medical-team-section.dto";

@Injectable()
export class MedicalTeamSectionService {
    constructor(private readonly prisma: PrismaService) {}

    async get() {
        let record = await this.prisma.medicalTeamSection.findFirst();

        if (!record) {
            record = await this.prisma.medicalTeamSection.create({
                data: {
                    title: "Default Medical Team Section Title",
                    description: "Default Medical Team Section Description",
                },
            });
        }

        return {
            success: true,
            message: "Medical Team Section retrieved successfully",
            data: record,
        };
    }

    async update(dto: UpdateMedicalTeamSectionDto) {
        let record = await this.prisma.medicalTeamSection.findFirst();

        if (!record) {
            record = await this.prisma.medicalTeamSection.create({
                data: {
                    title: dto.title || "Default Medical Team Section Title",
                    description: dto.description || "Default Medical Team Section Description",
                },
            });
        } else {
            record = await this.prisma.medicalTeamSection.update({
                where: { id: record.id },
                data: dto,
            });
        }

        return {
            success: true,
            message: "Medical Team Section updated successfully",
            data: record,
        };
    }
}
