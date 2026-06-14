import { Injectable } from "@nestjs/common";
import { PrismaService } from "@global/prisma/prisma.service";
import type { CategoryStatus } from "@constant/enums";
import type { BillingCycle } from "@constant/enums";

type PaymentPlanCreateData = {
    price: number;
    billingCycle?: BillingCycle;
};

type PaymentPlanUpdateData = {
    price?: number;
    billingCycle?: BillingCycle;
};

type CategoryCreateData = {
    name: string;
    description?: string | null;
    status?: CategoryStatus;
    iconId?: string;
    paymentPlan?: PaymentPlanCreateData;
};

type CategoryUpdateData = {
    name?: string;
    description?: string | null;
    status?: CategoryStatus;
    iconId?: string | null;
    paymentPlan?: PaymentPlanUpdateData;
};

type CategoryFindAllParams = {
    search?: string;
    status?: CategoryStatus;
    page: number;
    limit: number;
};

@Injectable()
export class CategoryRepository {
    constructor(private readonly prisma: PrismaService) {}

    create(data: CategoryCreateData) {
        const { paymentPlan, iconId, ...rest } = data;
        return this.prisma.category.create({
            data: {
                ...rest,
                ...(iconId ? { icon: { connect: { id: iconId } } } : {}),
                ...(paymentPlan
                    ? {
                          paymentPlan: {
                              create: {
                                  price: paymentPlan.price,
                                  ...(paymentPlan.billingCycle
                                      ? { billingCycle: paymentPlan.billingCycle }
                                      : {}),
                              },
                          },
                      }
                    : {}),
            },
            include: this.categoryInclude,
        });
    }

    async findAll(params: CategoryFindAllParams) {
        const { page, limit, search, status } = params;
        const where = {
            ...(status ? { status } : {}),
            ...(search
                ? {
                      OR: [
                          { name: { contains: search, mode: "insensitive" as const } },
                          { description: { contains: search, mode: "insensitive" as const } },
                      ],
                  }
                : {}),
        };

        const [data, total] = await this.prisma.$transaction([
            this.prisma.category.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: this.categoryInclude,
            }),
            this.prisma.category.count({ where }),
        ]);

        return { data, total };
    }

    findById(id: string) {
        return this.prisma.category.findUnique({
            where: { id },
            include: this.categoryInclude,
        });
    }

    findByName(name: string) {
        return this.prisma.category.findUnique({
            where: { name },
        });
    }

    update(id: string, data: CategoryUpdateData) {
        const { paymentPlan, iconId, ...rest } = data;

        const iconInput =
            iconId === null
                ? { icon: { disconnect: true } }
                : iconId
                  ? { icon: { connect: { id: iconId } } }
                  : {};

        const paymentPlanInput = paymentPlan
            ? {
                  paymentPlan: {
                      upsert: {
                          create: {
                              price: paymentPlan.price ?? 0,
                              ...(paymentPlan.billingCycle
                                  ? { billingCycle: paymentPlan.billingCycle }
                                  : {}),
                          },
                          update: {
                              ...(paymentPlan.price !== undefined
                                  ? { price: paymentPlan.price }
                                  : {}),
                              ...(paymentPlan.billingCycle
                                  ? { billingCycle: paymentPlan.billingCycle }
                                  : {}),
                          },
                      },
                  },
              }
            : {};

        return this.prisma.category.update({
            where: { id },
            data: { ...rest, ...iconInput, ...paymentPlanInput },
            include: this.categoryInclude,
        });
    }

    delete(id: string) {
        return this.prisma.category.delete({
            where: { id },
        });
    }

    private readonly categoryInclude = {
        paymentPlan: true,
        icon: true,
    };
}
