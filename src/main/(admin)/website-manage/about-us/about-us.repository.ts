import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

export const aboutUsInclude = {
    bodySection1Image: true,
    bodySection2Image: true,
    bodySection3Image: true,
    faqCardImage: true,
} as const;

@Injectable()
export class AboutUsRepository {
    constructor(private readonly prisma: PrismaService) {}

    findFirst() {
        return this.prisma.aboutUs.findFirst({
            include: aboutUsInclude,
        });
    }

    create(data: Prisma.AboutUsCreateInput | Prisma.AboutUsUncheckedCreateInput) {
        return this.prisma.aboutUs.create({
            data: data as any,
            include: aboutUsInclude,
        });
    }

    update(id: string, data: Prisma.AboutUsUpdateInput | Prisma.AboutUsUncheckedUpdateInput) {
        return this.prisma.aboutUs.update({
            where: { id },
            data: data as any,
            include: aboutUsInclude,
        });
    }
}
