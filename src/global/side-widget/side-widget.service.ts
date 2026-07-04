import { PrismaService } from "@global/prisma/prisma.service";
import { StorageService } from "@global/storage/storage.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { PageType } from "@prisma/client";
import { UpdateSideWidgetDto } from "./dto/update-side-widget.dto";

@Injectable()
export class SideWidgetService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly storageService: StorageService,
    ) {}

    async update(id: string, dto: UpdateSideWidgetDto) {
        const existing = await this.prisma.sideWidget.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundException("Side widget not found");
        }

        const sideWidget = await this.prisma.sideWidget.update({
            where: { id },
            data: dto,
            include: { image: true },
        });

        let responseData = sideWidget;
        if (sideWidget.image?.fileUrl) {
            responseData = {
                ...sideWidget,
                image: {
                    ...sideWidget.image,
                    fileUrl: await this.storageService.getSignedUrl(sideWidget.image.fileUrl),
                },
            };
        }

        return {
            success: true,
            message: "Side widget updated successfully",
            data: responseData,
        };
    }

    async findAll(pageType: PageType) {
        const sideWidgets = await this.prisma.sideWidget.findMany({
            where: { page: pageType },
            orderBy: { createdAt: "desc" },
            include: { image: true },
        });

        const mappedSideWidgets = await Promise.all(
            sideWidgets.map(async (widget) => {
                if (widget.image?.fileUrl) {
                    return {
                        ...widget,
                        image: {
                            ...widget.image,
                            fileUrl: await this.storageService.getSignedUrl(widget.image.fileUrl),
                        },
                    };
                }
                return widget;
            }),
        );

        return {
            success: true,
            message: "Side widgets retrieved successfully",
            data: mappedSideWidgets,
        };
    }
}
