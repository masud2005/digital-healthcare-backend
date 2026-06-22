import { IsEnum, IsOptional, IsString, IsUUID } from "class-validator";

export enum MessageType {
    TEXT = "TEXT",
    ATTACHMENT = "ATTACHMENT",
    PROPOSAL = "PROPOSAL",
}

export class CreateConversationDto {
    @IsUUID()
    serviceID: string;

    @IsUUID()
    patientId: string;

    @IsUUID()
    providerId: string;
}

export class RegisterPublicKeyDto {
    @IsString()
    publicKey: string; // PEM-encoded RSA public key from client
}

export class GetPublicKeyDto {
    @IsUUID()
    userId: string;
}

/**
 * Client performs hybrid encryption before sending:
 * 1. Generate random AES-256-GCM key
 * 2. Encrypt plaintext with AES key → produces ciphertext
 * 3. Encrypt AES key with recipient's RSA public key → encryptedKey
 * 4. Encrypt same plaintext with sender's own RSA public key → senderCopy
 * 5. Send all fields below to server — server stores ciphertext ONLY
 */
export class SendMessageDto {
    @IsUUID()
    conversationId: string;

    @IsString()
    senderCopy: string; // ciphertext encrypted with sender's public key

    @IsString()
    recipientCopy: string; // ciphertext encrypted with recipient's public key

    @IsString()
    iv: string; // AES-GCM IV (hex)

    @IsString()
    encryptedKey: string; // AES key encrypted with recipient's RSA public key

    @IsEnum(MessageType)
    @IsOptional()
    messageType?: MessageType;
}

export class JoinConversationDto {
    @IsUUID()
    conversationId: string;
}
