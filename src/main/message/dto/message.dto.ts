import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsDecimal, IsEnum, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export enum MessageType {
    TEXT = "TEXT",
    ATTACHMENT = "ATTACHMENT",
    PROPOSAL = "PROPOSAL",
}

export class CreateConversationDto {
    @ApiProperty({ example: "uuid-of-service-category" })
    @IsUUID()
    serviceID: string;

    @ApiProperty({ example: "uuid-of-patient" })
    @IsUUID()
    patientId: string;

    @ApiProperty({ example: "uuid-of-doctor" })
    @IsUUID()
    providerId: string;
}

export class RegisterPublicKeyDto {
    @ApiProperty({
        example: "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkq...\n-----END PUBLIC KEY-----",
        description: "PEM-encoded RSA public key for E2E encryption",
    })
    @IsString()
    publicKey: string;
}

export class GetPublicKeyDto {
    @ApiProperty({ example: "uuid-of-user" })
    @IsUUID()
    userId: string;
}

export class ProposalDto {
    @ApiProperty({ example: "Personalized Weight Loss Consultation" })
    @IsString()
    title: string;

    @ApiPropertyOptional({ example: "A tailored 4-week consultation plan." })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: "150.00", description: "Proposal fee as decimal string" })
    @IsDecimal()
    fee: string;

    @ApiPropertyOptional({ example: "2025-08-01T00:00:00.000Z" })
    @IsDateString()
    @IsOptional()
    proposalDate?: string;
}

export class SendMessageDto {
    @ApiProperty({ example: "uuid-of-conversation" })
    @IsUUID()
    conversationId: string;

    @ApiProperty({ description: "Ciphertext encrypted with sender's own public key" })
    @IsString()
    senderCopy: string;

    @ApiProperty({ description: "Ciphertext encrypted with recipient's public key" })
    @IsString()
    recipientCopy: string;

    @ApiProperty({ example: "a1b2c3d4...", description: "AES-GCM IV in hex" })
    @IsString()
    iv: string;

    @ApiProperty({ description: "AES key encrypted with recipient's RSA public key" })
    @IsString()
    encryptedKey: string;

    @ApiPropertyOptional({ enum: MessageType, example: MessageType.TEXT })
    @IsEnum(MessageType)
    @IsOptional()
    messageType?: MessageType;

    @ApiPropertyOptional({ type: () => ProposalDto, description: "Required when messageType is PROPOSAL" })
    @ValidateNested()
    @Type(() => ProposalDto)
    @IsOptional()
    proposal?: ProposalDto;

    @ApiPropertyOptional({ example: "uuid-of-attachment", description: "Required when messageType is ATTACHMENT" })
    @IsUUID()
    @IsOptional()
    attachmentId?: string;
}

export class JoinConversationDto {
    @ApiProperty({ example: "uuid-of-conversation" })
    @IsUUID()
    conversationId: string;
}

export class GetConversationsQueryDto {
    @ApiPropertyOptional({ example: "John", description: "Search by patient name, doctor name, or category name" })
    @IsString()
    @IsOptional()
    search?: string;
}
