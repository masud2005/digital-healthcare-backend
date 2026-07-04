import { PrismaService } from "@global/prisma/prisma.service";
import { StorageService } from "@global/storage/storage.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { UpdateContactSideWidgetDto } from "./dto/update-contact-side-widget.dto";

@Injectable()
export class ContactSideWidgetService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly storageService: StorageService,
    ) {}

    async get() {
        let record = await this.prisma.contactSideWidget.findFirst({
            include: { image: true },
        });
        
        if (!record) {
            record = await this.prisma.contactSideWidget.create({
                data: { 
                    title: "Office Hours", 
                    opening: "Monday - Friday: 9 AM - 6 PM",
                    offDay: "Our Office is closed from 2 PM to 3 PM for lunch.",
                    phone: "(720) 279-1164",
                    email: "info@wlmd.net"
                },
                include: { image: true },
            });
        }

        if (record.image?.fileUrl) {
            record.image.fileUrl = await this.storageService.getSignedUrl(record.image.fileUrl);
        }

        return {
            success: true,
            message: "Contact Side Widget retrieved successfully",
            data: record,
        };
    }

    async update(dto: UpdateContactSideWidgetDto) {
        let record = await this.prisma.contactSideWidget.findFirst();

        if (!record) {
            record = await this.prisma.contactSideWidget.create({
                data: {
                    title: dto.title || "Office Hours",
                    opening: dto.opening || "Monday - Friday: 9 AM - 6 PM",
                    offDay: dto.offDay || "Our Office is closed from 2 PM to 3 PM for lunch.",
                    phone: dto.phone || "(720) 279-1164",
                    email: dto.email || "info@wlmd.net",
                    imageId: dto.imageId
                },
            });
        } else {
            record = await this.prisma.contactSideWidget.update({
                where: { id: record.id },
                data: dto,
            });
        }

        // Re-fetch with image to resolve url
        const updatedRecord = await this.prisma.contactSideWidget.findFirst({
            where: { id: record.id },
            include: { image: true }
        });

        if (updatedRecord?.image?.fileUrl) {
            updatedRecord.image.fileUrl = await this.storageService.getSignedUrl(updatedRecord.image.fileUrl);
        }

        return {
            success: true,
            message: "Contact Side Widget updated successfully",
            data: updatedRecord,
        };
    }
}
