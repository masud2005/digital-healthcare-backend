import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { UpdateReportSideEffectDto } from "./dto/update-report-side-effect.dto";

@Injectable()
export class ReportSideEffectService {
    constructor(private readonly prisma: PrismaService) {}

    async get() {
        let symptoms = await this.prisma.symptomSeverity.findMany({
            orderBy: { order: "asc" },
        });

        if (symptoms.length === 0) {
            await this.prisma.symptomSeverity.createMany({
                data: [
                    { text: "Mild - Manageable, not affecting daily life", order: 1 },
                    { text: "Moderate - Affecting daily activities", order: 2 },
                    { text: "Severe - Significant impact, may need medical attention", order: 3 },
                    { text: "Life-threatening - Requires immediate emergency care", order: 4 },
                ],
            });
            symptoms = await this.prisma.symptomSeverity.findMany({
                orderBy: { order: "asc" },
            });
        }

        let widget = await this.prisma.emergencyContactWidget.findFirst({
            include: { contacts: { orderBy: { order: "asc" } } },
        });

        if (!widget) {
            widget = await this.prisma.emergencyContactWidget.create({
                data: {
                    sectionTitle: "Billing FAQ",
                    contacts: {
                        create: [
                            {
                                title: "Emergency Line",
                                contact: "911",
                                notes: "For life-threatening emergencies",
                                order: 1,
                            },
                        ],
                    },
                },
                include: { contacts: { orderBy: { order: "asc" } } },
            });
        }

        return {
            success: true,
            message: "Report Side Effect retrieved successfully",
            data: { symptoms, emergencyWidget: widget },
        };
    }

    async update(dto: UpdateReportSideEffectDto) {
        if (dto.symptoms) {
            await this.prisma.symptomSeverity.deleteMany({});
            if (dto.symptoms.length > 0) {
                await this.prisma.symptomSeverity.createMany({
                    data: dto.symptoms.map((s, index) => ({
                        text: s.text || "Untitled",
                        order: index,
                    })),
                });
            }
        }

        if (dto.emergencyWidget) {
            let widget = await this.prisma.emergencyContactWidget.findFirst();
            if (!widget) {
                widget = await this.prisma.emergencyContactWidget.create({
                    data: { sectionTitle: dto.emergencyWidget.sectionTitle || "" },
                });
            } else if (dto.emergencyWidget.sectionTitle !== undefined) {
                widget = await this.prisma.emergencyContactWidget.update({
                    where: { id: widget.id },
                    data: { sectionTitle: dto.emergencyWidget.sectionTitle },
                });
            }

            if (dto.emergencyWidget.contacts) {
                await this.prisma.emergencyContact.deleteMany({
                    where: { widgetId: widget.id },
                });

                if (dto.emergencyWidget.contacts.length > 0) {
                    await this.prisma.emergencyContact.createMany({
                        data: dto.emergencyWidget.contacts.map((c, index) => ({
                            widgetId: widget!.id,
                            title: c.title || "",
                            contact: c.contact || "",
                            notes: c.notes || "",
                            order: index,
                        })),
                    });
                }
            }
        }

        return this.get();
    }
}
