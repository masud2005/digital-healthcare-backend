import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

@Injectable()
export class EligibilityRepository {
    constructor(private readonly prisma: PrismaService) {}

    findFirst() {
        return this.prisma.eligibility.findFirst();
    }

    create(data: Prisma.EligibilityCreateInput | Prisma.EligibilityUncheckedCreateInput) {
        return this.prisma.eligibility.create({
            data: data as any,
        });
    }

    update(
        id: string,
        data: Prisma.EligibilityUpdateInput | Prisma.EligibilityUncheckedUpdateInput,
    ) {
        return this.prisma.eligibility.update({
            where: { id },
            data: data as any,
        });
    }
}
