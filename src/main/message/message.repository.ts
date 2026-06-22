import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { CreateConversationDto, SendMessageDto } from "./dto/message.dto";

@Injectable()
export class MessageRepository {
    constructor(private readonly prisma: PrismaService) {}

    // ── Public Key Management ──────────────────────────────────────────────

    upsertPublicKey(userId: string, publicKey: string) {
        return this.prisma.userPublicKey.upsert({
            where: { userId },
            create: { userId, publicKey },
            update: { publicKey },
        });
    }

    getPublicKey(userId: string) {
        return this.prisma.userPublicKey.findUnique({ where: { userId } });
    }

    // ── Conversations ──────────────────────────────────────────────────────

    createConversation(dto: CreateConversationDto) {
        return this.prisma.conversation.create({
            data: dto,
            include: {
                patient: { select: { id: true, name: true } },
                provider: { select: { id: true, name: true } },
            },
        });
    }

    findConversation(conversationId: string) {
        return this.prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                patient: { select: { id: true, name: true } },
                provider: { select: { id: true, name: true } },
            },
        });
    }

    findUserConversations(userId: string) {
        return this.prisma.conversation.findMany({
            where: { OR: [{ patientId: userId }, { providerId: userId }] },
            include: {
                patient: { select: { id: true, name: true } },
                provider: { select: { id: true, name: true } },
                // return last message (still encrypted — client decrypts)
                messages: { orderBy: { createdAt: "desc" }, take: 1, select: { id: true, createdAt: true, messageType: true, senderId: true } },
            },
            orderBy: { createdAt: "desc" },
        });
    }

    // ── Messages ───────────────────────────────────────────────────────────

    getMessages(conversationId: string, cursor?: string) {
        return this.prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: "asc" },
            take: 50,
            ...(cursor && { skip: 1, cursor: { id: cursor } }),
            select: {
                id: true,
                conversationId: true,
                senderId: true,
                senderCopy: true,
                recipientCopy: true,
                iv: true,
                encryptedKey: true,
                messageType: true,
                createdAt: true,
                sender: { select: { id: true, name: true } },
            },
        });
    }

    createMessage(dto: SendMessageDto, senderId: string) {
        return this.prisma.message.create({
            data: {
                conversationId: dto.conversationId,
                senderId,
                senderCopy: dto.senderCopy,
                recipientCopy: dto.recipientCopy,
                iv: dto.iv,
                encryptedKey: dto.encryptedKey,
                messageType: dto.messageType ?? "TEXT",
            },
            select: {
                id: true,
                conversationId: true,
                senderId: true,
                senderCopy: true,
                recipientCopy: true,
                iv: true,
                encryptedKey: true,
                messageType: true,
                createdAt: true,
                sender: { select: { id: true, name: true } },
            },
        });
    }
}
