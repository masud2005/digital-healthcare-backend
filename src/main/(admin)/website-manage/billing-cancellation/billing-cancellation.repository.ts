import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

@Injectable()
export class BillingCancellationRepository {
    constructor(private readonly prisma: PrismaService) {}

    findFirst() {
        return this.prisma.billingCancellation.findFirst();
    }

    create(data: Prisma.BillingCancellationCreateInput | Prisma.BillingCancellationUncheckedCreateInput) {
        return this.prisma.billingCancellation.create({
            data: data as any,
        });
    }

    update(id: string, data: Prisma.BillingCancellationUpdateInput | Prisma.BillingCancellationUncheckedUpdateInput) {
        return this.prisma.billingCancellation.update({
            where: { id },
            data: data as any,
        });
    }
}
