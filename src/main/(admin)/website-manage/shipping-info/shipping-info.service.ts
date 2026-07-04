import { PrismaService } from "@global/prisma/prisma.service";
import { StorageService } from "@global/storage/storage.service";
import { Injectable } from "@nestjs/common";
import { UpdateShippingInfoDto } from "./dto/update-shipping-info.dto";

@Injectable()
export class ShippingInfoService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly storageService: StorageService,
    ) {}

    async get() {
        let partnerSection = await this.prisma.partnerPharmacySection.findFirst({
            include: { partners: { include: { logo: true }, orderBy: { order: 'asc' } } }
        });
        
        let timelineSection = await this.prisma.shippingTimelineSection.findFirst({
            include: { steps: { orderBy: { order: 'asc' } } }
        });
        
        let policySection = await this.prisma.shippingPolicySection.findFirst({
            include: { policies: { orderBy: { order: 'asc' } } }
        });

        // Initialize Defaults if missing
        if (!partnerSection) {
            partnerSection = await this.prisma.partnerPharmacySection.create({
                data: {
                    title: "Partner Pharmacy Network",
                    description: "Pharmacy assignment is based on your state, medication type, and current provider relationships.",
                },
                include: { partners: { include: { logo: true }, orderBy: { order: 'asc' } } }
            });
        }
        
        if (!timelineSection) {
            timelineSection = await this.prisma.shippingTimelineSection.create({
                data: {
                    title: "Shipping Timeline",
                    description: "Timelines are estimates. Expedited options may be available. Cold-chain medications may require signature.",
                    steps: {
                        create: [
                            { title: "Rx Received", description: "Day 0", order: 1 },
                            { title: "Processing", description: "Day 1-2", order: 2 },
                            { title: "Shipped", description: "Day 2-4", order: 3 },
                            { title: "In Transit", description: "Day 2-7", order: 4 },
                            { title: "Delivered", description: "Day 3-7", order: 5 },
                        ]
                    }
                },
                include: { steps: { orderBy: { order: 'asc' } } }
            });
        }
        
        if (!policySection) {
            policySection = await this.prisma.shippingPolicySection.create({
                data: {
                    title: "Shipping Policy",
                    description: "",
                    disclaimerTitle: "Prescription & Pharmacy Disclosure:",
                    disclaimerDescription: "All medications dispensed through our platform require a valid prescription from a licensed provider. We partner only with NABP-accredited or PCAB-accredited pharmacies. Compounded medications are not FDA-approved drug products and are prepared by state-licensed compounding pharmacies.",
                    policies: {
                        create: [
                            { text: "Tracking number emailed when shipped", order: 1 },
                            { text: "Track in your patient portal", order: 2 },
                            { text: "SMS notifications available", order: 3 },
                            { text: "Only ships within the US", order: 4 },
                            { text: "Cannot ship to states without licensed providers", order: 5 },
                            { text: "P.O. boxes may not be eligible for cold-chain meds", order: 6 },
                            { text: "No international shipments", order: 7 },
                        ]
                    }
                },
                include: { policies: { orderBy: { order: 'asc' } } }
            });
        }

        // Sign Logo URLs
        if (partnerSection && partnerSection.partners) {
            partnerSection.partners = await Promise.all(partnerSection.partners.map(async (partner) => {
                if (partner.logo?.fileUrl) {
                    partner.logo.fileUrl = await this.storageService.getSignedUrl(partner.logo.fileUrl);
                }
                return partner;
            }));
        }

        return {
            success: true,
            message: "Shipping Info retrieved successfully",
            data: {
                partnerPharmacySection: partnerSection,
                shippingTimelineSection: timelineSection,
                shippingPolicySection: policySection
            }
        };
    }

    async update(dto: UpdateShippingInfoDto) {
        // Partner Pharmacy Section
        if (dto.partnerPharmacySection) {
            let section = await this.prisma.partnerPharmacySection.findFirst();
            if (!section) {
                section = await this.prisma.partnerPharmacySection.create({
                    data: {
                        title: dto.partnerPharmacySection.title || "",
                        description: dto.partnerPharmacySection.description || "",
                    }
                });
            } else {
                section = await this.prisma.partnerPharmacySection.update({
                    where: { id: section.id },
                    data: {
                        title: dto.partnerPharmacySection.title,
                        description: dto.partnerPharmacySection.description,
                    }
                });
            }
            if (dto.partnerPharmacySection.partners) {
                await this.prisma.partnerPharmacy.deleteMany({ where: { sectionId: section.id } });
                if (dto.partnerPharmacySection.partners.length > 0) {
                    await this.prisma.partnerPharmacy.createMany({
                        data: dto.partnerPharmacySection.partners.map((p, index) => ({
                            sectionId: section!.id,
                            name: p.name || "",
                            address: p.address || "",
                            logoId: p.logoId,
                            order: index
                        }))
                    });
                }
            }
        }

        // Shipping Timeline Section
        if (dto.shippingTimelineSection) {
            let section = await this.prisma.shippingTimelineSection.findFirst();
            if (!section) {
                section = await this.prisma.shippingTimelineSection.create({
                    data: {
                        title: dto.shippingTimelineSection.title || "",
                        description: dto.shippingTimelineSection.description || "",
                    }
                });
            } else {
                section = await this.prisma.shippingTimelineSection.update({
                    where: { id: section.id },
                    data: {
                        title: dto.shippingTimelineSection.title,
                        description: dto.shippingTimelineSection.description,
                    }
                });
            }
            if (dto.shippingTimelineSection.steps) {
                await this.prisma.shippingTimelineStep.deleteMany({ where: { sectionId: section.id } });
                if (dto.shippingTimelineSection.steps.length > 0) {
                    await this.prisma.shippingTimelineStep.createMany({
                        data: dto.shippingTimelineSection.steps.map((s, index) => ({
                            sectionId: section!.id,
                            title: s.title || "",
                            description: s.description || "",
                            order: index
                        }))
                    });
                }
            }
        }

        // Shipping Policy Section
        if (dto.shippingPolicySection) {
            let section = await this.prisma.shippingPolicySection.findFirst();
            if (!section) {
                section = await this.prisma.shippingPolicySection.create({
                    data: {
                        title: dto.shippingPolicySection.title || "",
                        description: dto.shippingPolicySection.description || "",
                        disclaimerTitle: dto.shippingPolicySection.disclaimerTitle || "",
                        disclaimerDescription: dto.shippingPolicySection.disclaimerDescription || "",
                    }
                });
            } else {
                section = await this.prisma.shippingPolicySection.update({
                    where: { id: section.id },
                    data: {
                        title: dto.shippingPolicySection.title,
                        description: dto.shippingPolicySection.description,
                        disclaimerTitle: dto.shippingPolicySection.disclaimerTitle,
                        disclaimerDescription: dto.shippingPolicySection.disclaimerDescription,
                    }
                });
            }
            if (dto.shippingPolicySection.policies) {
                await this.prisma.shippingPolicyItem.deleteMany({ where: { sectionId: section.id } });
                if (dto.shippingPolicySection.policies.length > 0) {
                    await this.prisma.shippingPolicyItem.createMany({
                        data: dto.shippingPolicySection.policies.map((p, index) => ({
                            sectionId: section!.id,
                            text: p.text || "",
                            order: index
                        }))
                    });
                }
            }
        }

        return this.get();
    }
}
