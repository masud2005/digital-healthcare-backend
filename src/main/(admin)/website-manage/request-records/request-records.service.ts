import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { UpdateRequestRecordsDto } from "./dto/update-request-records.dto";

@Injectable()
export class RequestRecordsService {
    constructor(private readonly prisma: PrismaService) {}

    async get() {
        let widgets = await this.prisma.requestRecordWidget.findMany({
            include: { items: { orderBy: { order: "asc" } } },
            orderBy: { order: "asc" },
        });

        if (widgets.length === 0) {
            // Seed defaults
            await this.prisma.requestRecordWidget.create({
                data: {
                    title: "Processing Time",
                    order: 1,
                    items: {
                        create: [
                            { text: "Medical Records: Up to 30 days", order: 1 },
                            { text: "Prescription History: 3-5 business days", order: 2 },
                            { text: "Billing Records: 1-3 business days", order: 3 },
                            { text: "Account Deletion: Up to 45 days", order: 4 },
                        ],
                    },
                },
            });
            await this.prisma.requestRecordWidget.create({
                data: {
                    title: "HIPAA Rights",
                    order: 2,
                    items: {
                        create: [
                            { text: "Right to access your medical records", order: 1 },
                            { text: "Right to request corrections", order: 2 },
                            { text: "Right to receive an accounting of disclosures", order: 3 },
                            { text: "Right to restrict certain uses", order: 4 },
                            { text: "Right to receive records in electronic format", order: 5 },
                        ],
                    },
                },
            });

            widgets = await this.prisma.requestRecordWidget.findMany({
                include: { items: { orderBy: { order: "asc" } } },
                orderBy: { order: "asc" },
            });
        }

        return {
            success: true,
            message: "Request Records retrieved successfully",
            data: widgets,
        };
    }

    async update(dto: UpdateRequestRecordsDto) {
        if (dto.widgets) {
            // Delete all existing widgets (cascade will handle items)
            await this.prisma.requestRecordWidget.deleteMany({});

            if (dto.widgets.length > 0) {
                for (let i = 0; i < dto.widgets.length; i++) {
                    const widgetDto = dto.widgets[i];
                    await this.prisma.requestRecordWidget.create({
                        data: {
                            title: widgetDto.title || "Untitled",
                            order: i,
                            items: {
                                create: (widgetDto.items || []).map((item, index) => ({
                                    text: item.text || "",
                                    order: index,
                                })),
                            },
                        },
                    });
                }
            }
        }

        return this.get();
    }
}
