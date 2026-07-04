import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

@Injectable()
export class HowItWorksRepository {
    constructor(private readonly prisma: PrismaService) {}

    findFirst() {
        return this.prisma.howItWorks.findFirst();
    }

    create(data: Prisma.HowItWorksCreateInput | Prisma.HowItWorksUncheckedCreateInput) {
        return this.prisma.howItWorks.create({
            data: data as any,
        });
    }

    update(id: string, data: Prisma.HowItWorksUpdateInput | Prisma.HowItWorksUncheckedUpdateInput) {
        return this.prisma.howItWorks.update({
            where: { id },
            data: data as any,
        });
    }
}
