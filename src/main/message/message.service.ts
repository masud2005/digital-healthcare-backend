import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { createPublicKey } from "crypto";
import { MessageRepository } from "./message.repository";
import { CreateConversationDto, RegisterPublicKeyDto, SendMessageDto } from "./dto/message.dto";

@Injectable()
export class MessageService {
    constructor(private readonly repo: MessageRepository) {}

    // ── Public Key ─────────────────────────────────────────────────────────

    registerPublicKey(userId: string, dto: RegisterPublicKeyDto) {
        // Validate it's a legitimate RSA public key before storing
        try {
            createPublicKey(dto.publicKey);
        } catch {
            throw new BadRequestException("Invalid RSA public key");
        }
        return this.repo.upsertPublicKey(userId, dto.publicKey);
    }

    async getPublicKey(userId: string) {
        const record = await this.repo.getPublicKey(userId);
        if (!record) throw new NotFoundException("Public key not found for this user");
        return record;
    }

    // ── Conversations ──────────────────────────────────────────────────────

    async createConversation(dto: CreateConversationDto) {
        // Ensure both participants have registered their public keys
        const [patientKey, providerKey] = await Promise.all([
            this.repo.getPublicKey(dto.patientId),
            this.repo.getPublicKey(dto.providerId),
        ]);

        if (!patientKey) throw new BadRequestException("Patient has not registered a public key");
        if (!providerKey) throw new BadRequestException("Doctor has not registered a public key");

        return this.repo.createConversation(dto);
    }

    getMyConversations(userId: string) {
        return this.repo.findUserConversations(userId);
    }

    async getMessages(conversationId: string, userId: string, cursor?: string) {
        const conversation = await this.repo.findConversation(conversationId);
        if (!conversation) throw new NotFoundException("Conversation not found");

        if (conversation.patientId !== userId && conversation.providerId !== userId) {
            throw new ForbiddenException("Access denied");
        }

        return this.repo.getMessages(conversationId, cursor);
    }

    // ── Messages ───────────────────────────────────────────────────────────

    async sendMessage(dto: SendMessageDto, senderId: string) {
        const conversation = await this.repo.findConversation(dto.conversationId);
        if (!conversation) throw new NotFoundException("Conversation not found");

        if (conversation.patientId !== senderId && conversation.providerId !== senderId) {
            throw new ForbiddenException("Access denied");
        }

        // Validate all E2E fields are present and non-empty
        if (!dto.senderCopy || !dto.recipientCopy || !dto.iv || !dto.encryptedKey) {
            throw new BadRequestException("Missing encryption fields");
        }

        return this.repo.createMessage(dto, senderId);
    }
}
