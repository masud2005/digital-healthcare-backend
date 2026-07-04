import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { UpdateHippaNoticeDto } from "./dto/update-hippa-notice.dto";

@Injectable()
export class HippaNoticeService {
    constructor(private readonly prisma: PrismaService) {}

    async get() {
        // Assume there's only one record for now, or get the first one
        let record = await this.prisma.hippaNotice.findFirst();

        // If not found, you can return a default or error. We'll return an empty object or the newly created one.
        if (!record) {
            record = await this.prisma.hippaNotice.create({
                data: { content: "<p>Default HIPAA Notice Content</p>" },
            });
        }

        return {
            success: true,
            message: "HIPAA Notice retrieved successfully",
            data: record,
        };
    }

    async update(dto: UpdateHippaNoticeDto) {
        let record = await this.prisma.hippaNotice.findFirst();

        if (!record) {
            record = await this.prisma.hippaNotice.create({
                data: { content: dto.content || "" },
            });
        } else {
            record = await this.prisma.hippaNotice.update({
                where: { id: record.id },
                data: dto,
            });
        }

        return {
            success: true,
            message: "HIPAA Notice updated successfully",
            data: record,
        };
    }
}
