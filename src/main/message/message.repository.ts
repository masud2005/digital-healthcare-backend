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
                patient: {
                    select: {
                        id: true,
                        name: true,
                        patientProfile: { select: { name: true, avatar: { select: { id: true, fileUrl: true } } } },
                    },
                },
                provider: {
                    select: {
                        id: true,
                        name: true,
                        doctorProfile: { select: { name: true, title: true, avatar: { select: { id: true, fileUrl: true } } } },
                    },
                },
                service: { select: { id: true, name: true } },
            },
        });
    }

    findUserConversations(userId: string, search?: string) {
        return this.prisma.conversation.findMany({
            where: {
                OR: [{ patientId: userId }, { providerId: userId }],
                ...(search && {
                    OR: [
                        { patient: { patientProfile: { name: { contains: search, mode: "insensitive" } } } },
                        { provider: { doctorProfile: { name: { contains: search, mode: "insensitive" } } } },
                        { service: { name: { contains: search, mode: "insensitive" } } },
                    ],
                }),
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        name: true,
                        patientProfile: { select: { name: true, avatar: { select: { id: true, fileUrl: true } } } },
                    },
                },
                provider: {
                    select: {
                        id: true,
                        name: true,
                        doctorProfile: { select: { name: true, title: true, avatar: { select: { id: true, fileUrl: true } } } },
                    },
                },
                service: { select: { id: true, name: true } },
                messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    select: { id: true, createdAt: true, messageType: true, senderId: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    }

    findLatestSubmission(patientId: string, categoryId: string) {
        return this.prisma.assessmentSubmission.findFirst({
            where: { userId: patientId, assessment: { categoryId } },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                submissionCode: true,
                status: true,
                assessment: { select: { id: true, title: true } },
            },
        });
    }

    findServiceInfo(patientId: string, categoryId: string) {
        return this.prisma.subscription.findFirst({
            where: { userId: patientId, categoryId, status: "ACTIVE" },
            orderBy: { createdAt: "desc" },
            select: {
                startDate: true,
                nextBillingDate: true,
                paymentPlan: { select: { price: true, billingCycle: true } },
                category: { select: { name: true } },
            },
        });
    }

    findConversationFiles(conversationId: string) {
        return this.prisma.attachment.findMany({
            where: { message: { conversationId } },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                fileName: true,
                fileUrl: true,
                fileType: true,
                fileSize: true,
                createdAt: true,
                uploadedById: true,
            },
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
                proposals: {
                    select: { id: true, title: true, description: true, fee: true, proposalDate: true, status: true, updatedAt: true },
                },
                attachments: {
                    select: { id: true, fileName: true, fileUrl: true, fileType: true, fileSize: true },
                },
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
                ...(dto.proposal && {
                    proposals: {
                        create: {
                            title: dto.proposal.title,
                            description: dto.proposal.description,
                            fee: dto.proposal.fee,
                            proposalDate: dto.proposal.proposalDate ? new Date(dto.proposal.proposalDate) : undefined,
                        },
                    },
                }),
                ...(dto.attachmentId && {
                    attachments: { connect: { id: dto.attachmentId } },
                }),
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
                proposals: {
                    select: { id: true, title: true, description: true, fee: true, proposalDate: true, status: true, updatedAt: true },
                },
                attachments: {
                    select: { id: true, fileName: true, fileUrl: true, fileType: true, fileSize: true },
                },
            },
        });
    }
}
