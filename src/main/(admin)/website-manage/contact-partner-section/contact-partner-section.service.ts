import { PrismaService } from "@global/prisma/prisma.service";
import { StorageService } from "@global/storage/storage.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { UpdateContactPartnerSectionDto } from "./dto/update-contact-partner-section.dto";

@Injectable()
export class ContactPartnerSectionService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly storageService: StorageService,
    ) {}

    async get() {
        let record = await this.prisma.contactPartnerSection.findFirst({
            include: { 
                partners: {
                    include: { image: true }
                } 
            },
        });
        
        if (!record) {
            record = await this.prisma.contactPartnerSection.create({
                data: { 
                    sectionTitle: "Our partner pharmacies"
                },
                include: { partners: { include: { image: true } } },
            });
        }

        // Map signed urls for all partner images
        if (record.partners && record.partners.length > 0) {
            record.partners = await Promise.all(record.partners.map(async (partner) => {
                if (partner.image?.fileUrl) {
                    partner.image.fileUrl = await this.storageService.getSignedUrl(partner.image.fileUrl);
                }
                return partner;
            }));
        }

        return {
            success: true,
            message: "Contact Partner Section retrieved successfully",
            data: record,
        };
    }

    async update(dto: UpdateContactPartnerSectionDto) {
        let record = await this.prisma.contactPartnerSection.findFirst();

        if (!record) {
            record = await this.prisma.contactPartnerSection.create({
                data: {
                    sectionTitle: dto.sectionTitle || "Our partner pharmacies"
                },
            });
        } else if (dto.sectionTitle) {
            record = await this.prisma.contactPartnerSection.update({
                where: { id: record.id },
                data: { sectionTitle: dto.sectionTitle },
            });
        }

        // Handle imageIds (replace all partners)
        if (dto.imageIds) {
            // First delete existing
            await this.prisma.contactPartner.deleteMany({
                where: { sectionId: record.id }
            });
            
            // Create new ones
            if (dto.imageIds.length > 0) {
                await this.prisma.contactPartner.createMany({
                    data: dto.imageIds.map(imageId => ({
                        sectionId: record.id,
                        imageId
                    }))
                });
            }
        }

        // Re-fetch with images to resolve url
        const updatedRecord = await this.prisma.contactPartnerSection.findFirst({
            where: { id: record.id },
            include: { 
                partners: {
                    include: { image: true }
                } 
            }
        });

        if (updatedRecord?.partners && updatedRecord.partners.length > 0) {
            updatedRecord.partners = await Promise.all(updatedRecord.partners.map(async (partner) => {
                if (partner.image?.fileUrl) {
                    partner.image.fileUrl = await this.storageService.getSignedUrl(partner.image.fileUrl);
                }
                return partner;
            }));
        }

        return {
            success: true,
            message: "Contact Partner Section updated successfully",
            data: updatedRecord,
        };
    }
}
