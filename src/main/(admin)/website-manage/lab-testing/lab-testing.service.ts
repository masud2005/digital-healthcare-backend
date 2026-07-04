import { PrismaService } from "@global/prisma/prisma.service";
import { StorageService } from "@global/storage/storage.service";
import { Injectable } from "@nestjs/common";
import { UpdateLabTestingHeroDto } from "./dto/update-lab-testing-hero.dto";
import { UpdateLabTestingSectionDto } from "./dto/update-lab-testing-section.dto";

@Injectable()
export class LabTestingService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly storageService: StorageService,
    ) {}

    // HERO
    async getHero() {
        let record = await this.prisma.labTestingHero.findFirst({
            include: { image: true },
        });
        
        if (!record) {
            record = await this.prisma.labTestingHero.create({
                data: { 
                    title: "WLMD Lab Tests", 
                    description: "Learn about our extensive lab testing services.",
                    buttonText: "Book a consultation",
                    buttonUrl: "https://weightlossmd.com",
                    isBlank: true
                },
                include: { image: true },
            });
        }

        if (record.image?.fileUrl) {
            record.image.fileUrl = await this.storageService.getSignedUrl(record.image.fileUrl);
        }

        return {
            success: true,
            message: "Lab Testing Hero retrieved successfully",
            data: record,
        };
    }

    async updateHero(dto: UpdateLabTestingHeroDto) {
        let record = await this.prisma.labTestingHero.findFirst();

        if (!record) {
            record = await this.prisma.labTestingHero.create({
                data: {
                    title: dto.title || "WLMD Lab Tests",
                    description: dto.description || "Learn about our extensive lab testing services.",
                    buttonText: dto.buttonText,
                    buttonUrl: dto.buttonUrl,
                    isBlank: dto.isBlank ?? true,
                    imageId: dto.imageId
                },
            });
        } else {
            record = await this.prisma.labTestingHero.update({
                where: { id: record.id },
                data: dto,
            });
        }

        const updatedRecord = await this.prisma.labTestingHero.findFirst({
            where: { id: record.id },
            include: { image: true }
        });

        if (updatedRecord?.image?.fileUrl) {
            updatedRecord.image.fileUrl = await this.storageService.getSignedUrl(updatedRecord.image.fileUrl);
        }

        return {
            success: true,
            message: "Lab Testing Hero updated successfully",
            data: updatedRecord,
        };
    }

    // SECTION
    async getSection() {
        let record = await this.prisma.labTestingSection.findFirst({
            include: { 
                services: {
                    include: { 
                        image: true,
                        tests: { orderBy: { createdAt: "asc" } }
                    },
                    orderBy: { createdAt: "asc" }
                } 
            },
        });
        
        if (!record) {
            record = await this.prisma.labTestingSection.create({
                data: { 
                    sectionTitle: "See what's inside the panel",
                    sectionDescription: "Measure what matters—up to 130 biomarker tests..."
                },
                include: { services: { include: { image: true, tests: true } } },
            });
        }

        if (record.services && record.services.length > 0) {
            record.services = await Promise.all(record.services.map(async (service) => {
                if (service.image?.fileUrl) {
                    service.image.fileUrl = await this.storageService.getSignedUrl(service.image.fileUrl);
                }
                return service;
            }));
        }

        return {
            success: true,
            message: "Lab Testing Section retrieved successfully",
            data: record,
        };
    }

    async updateSection(dto: UpdateLabTestingSectionDto) {
        let record = await this.prisma.labTestingSection.findFirst();

        if (!record) {
            record = await this.prisma.labTestingSection.create({
                data: {
                    sectionTitle: dto.sectionTitle || "See what's inside the panel",
                    sectionDescription: dto.sectionDescription || "Measure what matters—up to 130 biomarker tests..."
                },
            });
        } else {
            record = await this.prisma.labTestingSection.update({
                where: { id: record.id },
                data: { 
                    sectionTitle: dto.sectionTitle,
                    sectionDescription: dto.sectionDescription
                },
            });
        }

        if (dto.services) {
            await this.prisma.labTestService.deleteMany({
                where: { sectionId: record.id }
            });

            for (const service of dto.services) {
                await this.prisma.labTestService.create({
                    data: {
                        sectionId: record.id,
                        title: service.title || "Untitled",
                        description: service.description || "",
                        imageId: service.imageId,
                        tests: {
                            create: (service.tests || []).map(t => ({
                                name: t.name || "",
                                duration: t.duration || "",
                                description: t.description || ""
                            }))
                        }
                    }
                });
            }
        }

        const updatedRecord = await this.prisma.labTestingSection.findFirst({
            where: { id: record.id },
            include: { 
                services: {
                    include: { 
                        image: true,
                        tests: { orderBy: { createdAt: "asc" } }
                    },
                    orderBy: { createdAt: "asc" }
                } 
            }
        });

        if (updatedRecord?.services && updatedRecord.services.length > 0) {
            updatedRecord.services = await Promise.all(updatedRecord.services.map(async (service) => {
                if (service.image?.fileUrl) {
                    service.image.fileUrl = await this.storageService.getSignedUrl(service.image.fileUrl);
                }
                return service;
            }));
        }

        return {
            success: true,
            message: "Lab Testing Section updated successfully",
            data: updatedRecord,
        };
    }
}
