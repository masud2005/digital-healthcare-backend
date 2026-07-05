import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@global/prisma/prisma.service";
import { CreatePaymentCardDto } from "./dto/payment-card.dto";

@Injectable()
export class PaymentCardService {
    constructor(private readonly prisma: PrismaService) {}

    async createCard(userId: string, dto: CreatePaymentCardDto) {
        if (dto.isDefault) {
            await this.prisma.paymentCard.updateMany({
                where: { userId },
                data: { isDefault: false },
            });
        }

        // Check if there are no existing cards, make the first one default
        const existingCardCount = await this.prisma.paymentCard.count({ where: { userId } });
        const isDefault = existingCardCount === 0 ? true : (dto.isDefault ?? false);

        return this.prisma.paymentCard.create({
            data: {
                userId,
                cloverToken: dto.cloverToken,
                last4: dto.last4,
                brand: dto.brand,
                expMonth: dto.expMonth,
                expYear: dto.expYear,
                cardHolderName: dto.cardHolderName,
                isDefault,
            },
        });
    }

    async getMyCards(userId: string) {
        return this.prisma.paymentCard.findMany({
            where: { userId },
            orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
            select: {
                id: true,
                cardHolderName: true,
                last4: true,
                brand: true,
                expMonth: true,
                expYear: true,
                isDefault: true,
                createdAt: true,
            },
        });
    }

    async setDefaultCard(userId: string, cardId: string) {
        const card = await this.prisma.paymentCard.findFirst({
            where: { id: cardId, userId },
        });

        if (!card) {
            throw new NotFoundException("Payment card not found.");
        }

        await this.prisma.paymentCard.updateMany({
            where: { userId },
            data: { isDefault: false },
        });

        return this.prisma.paymentCard.update({
            where: { id: cardId },
            data: { isDefault: true },
        });
    }

    async deleteCard(userId: string, cardId: string) {
        const card = await this.prisma.paymentCard.findFirst({
            where: { id: cardId, userId },
        });

        if (!card) {
            throw new NotFoundException("Payment card not found.");
        }

        await this.prisma.paymentCard.delete({
            where: { id: cardId },
        });

        if (card.isDefault) {
            // make the most recent card default
            const latestCard = await this.prisma.paymentCard.findFirst({
                where: { userId },
                orderBy: { createdAt: "desc" },
            });
            if (latestCard) {
                await this.prisma.paymentCard.update({
                    where: { id: latestCard.id },
                    data: { isDefault: true },
                });
            }
        }

        return { success: true, message: "Payment card deleted successfully." };
    }
}
