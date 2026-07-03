import { AttachmentService } from "@global/attachment/attachment.service";
import { StorageService } from "@global/storage/storage.service";
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { createPublicKey } from "crypto";
import { NotificationService } from "../notification/notification.service";
import { CreateConversationDto, RegisterPublicKeyDto, SendMessageDto } from "./dto/message.dto";
import { MessageRepository } from "./message.repository";
import { OnlineStore } from "./online.store";
import { CommunicationService } from "@global/communication/communication.service";

@Injectable()
export class MessageService {
    constructor(
        private readonly repo: MessageRepository,
        private readonly attachmentService: AttachmentService,
        private readonly storageService: StorageService,
        private readonly onlineStore: OnlineStore,
        private readonly notificationService: NotificationService,
        private readonly communicationService: CommunicationService,
    ) {}

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

        // Check if conversation already exists
        const existingConversation = await this.repo.findExistingConversation(
            dto.patientId,
            dto.providerId,
            dto.serviceID,
        );

        if (existingConversation) {
            return existingConversation;
        }

        return this.repo.createConversation(dto);
    }

    async autoCreateConversation(patientId: string, providerId: string, serviceID: string) {
        const existing = await this.repo.findExistingConversation(patientId, providerId, serviceID);
        if (existing) return existing;
        return this.repo.createConversation({ patientId, providerId, serviceID });
    }

    async getMyConversations(userId: string, search?: string) {
        const conversations = await this.repo.findUserConversations(userId, search);

        return Promise.all(
            conversations.map(async (conv) => {
                const submission = await this.repo.findLatestSubmission(
                    conv.patientId,
                    conv.serviceID,
                );

                const resolveAvatar = async (fileUrl: string | null | undefined) =>
                    fileUrl ? this.storageService.getSignedUrl(fileUrl) : null;

                const patientAvatar = conv.patient.patientProfile?.avatar?.fileUrl;
                const providerAvatar = conv.provider.doctorProfile?.avatar?.fileUrl;

                return {
                    ...conv,
                    patient: {
                        id: conv.patient.id,
                        name: conv.patient.patientProfile?.name ?? conv.patient.name,
                        avatar: await resolveAvatar(patientAvatar),
                    },
                    provider: {
                        id: conv.provider.id,
                        name: conv.provider.doctorProfile?.name ?? conv.provider.name,
                        title: conv.provider.doctorProfile?.title ?? null,
                        avatar: await resolveAvatar(providerAvatar),
                    },
                    service: conv.service,
                    submission: submission
                        ? {
                              id: submission.id,
                              submissionCode: submission.submissionCode,
                              status: submission.status,
                              assessment: submission.assessment,
                          }
                        : null,
                    isPatientOnline: this.onlineStore.isOnline(conv.patientId),
                    isProviderOnline: this.onlineStore.isOnline(conv.providerId),
                };
            }),
        );
    }

    async getMessages(conversationId: string, userId: string, cursor?: string) {
        const conversation = await this.repo.findConversation(conversationId);
        if (!conversation) throw new NotFoundException("Conversation not found");

        if (conversation.patientId !== userId && conversation.providerId !== userId) {
            throw new ForbiddenException("Access denied");
        }

        const resolveAvatar = async (fileUrl: string | null | undefined) =>
            fileUrl ? this.storageService.getSignedUrl(fileUrl) : null;

        const submission = await this.repo.findLatestSubmission(
            conversation.patientId,
            conversation.serviceID,
        );

        const enrichedConversation = {
            ...conversation,
            patient: {
                id: conversation.patient.id,
                name: conversation.patient.patientProfile?.name ?? conversation.patient.name,
                avatar: await resolveAvatar(conversation.patient.patientProfile?.avatar?.fileUrl),
            },
            provider: {
                id: conversation.provider.id,
                name: conversation.provider.doctorProfile?.name ?? conversation.provider.name,
                title: conversation.provider.doctorProfile?.title ?? null,
                avatar: await resolveAvatar(conversation.provider.doctorProfile?.avatar?.fileUrl),
            },
            service: conversation.service,
            submission: submission
                ? {
                      id: submission.id,
                      submissionCode: submission.submissionCode,
                      status: submission.status,
                      assessment: submission.assessment,
                  }
                : null,
            isPatientOnline: this.onlineStore.isOnline(conversation.patientId),
            isProviderOnline: this.onlineStore.isOnline(conversation.providerId),
        };

        const messages = await this.repo.getMessages(conversationId, cursor);
        return {
            conversation: enrichedConversation,
            messages: await this.resolveMessageAttachments(messages),
        };
    }

    async getServiceInfo(conversationId: string, userId: string) {
        const conversation = await this.repo.findConversation(conversationId);
        if (!conversation) throw new NotFoundException("Conversation not found");
        if (conversation.patientId !== userId && conversation.providerId !== userId) {
            throw new ForbiddenException("Access denied");
        }

        const info = await this.repo.findServiceInfo(
            conversation.patientId,
            conversation.serviceID,
        );
        if (!info) throw new NotFoundException("No active subscription found for this service");

        return {
            subscriptionId: info.id,
            serviceName: info.category.name,
            serviceFees: info.paymentPlan.price,
            serviceDuration: info.paymentPlan.billingCycle,
            serviceStart: info.startDate,
            nextBillingDate: info.nextBillingDate,
        };
    }

    async cancelSubscription(conversationId: string, userId: string) {
        const conversation = await this.repo.findConversation(conversationId);
        if (!conversation) throw new NotFoundException("Conversation not found");
        if (conversation.patientId !== userId && conversation.providerId !== userId) {
            throw new ForbiddenException("Access denied");
        }

        const info = await this.repo.findServiceInfo(
            conversation.patientId,
            conversation.serviceID,
        );
        if (!info) throw new NotFoundException("No active subscription found for this service");

        const result = await this.repo.cancelSubscription(info.id);

        const patientName = conversation.patient.patientProfile?.name ?? conversation.patient.name;
        const serviceName = info.category.name;

        // Notify Doctor
        await this.notificationService.send({
            userId: conversation.providerId,
            title: "Subscription Cancelled",
            message: `Patient ${patientName} has cancelled their subscription for ${serviceName}.`,
            actionType: "SUBSCRIPTION_CANCELLED",
            referenceId: info.id,
        });

        // Email to Doctor
        if ((conversation.provider as any).email) {
            await this.communicationService
                .dispatch({
                    action: "SUBSCRIPTION_CANCELLED",
                    channel: "EMAIL",
                    to: (conversation.provider as any).email,
                    payload: { name: patientName, serviceName },
                })
                .catch((e) => console.error("Failed to send subscription cancelled email:", e));
        }

        // Notify Admins
        await this.notificationService.sendToAdmins({
            title: "Subscription Cancelled",
            message: `Patient ${patientName} has cancelled their subscription for ${serviceName}.`,
            actionType: "SUBSCRIPTION_CANCELLED",
            referenceId: info.id,
        });

        return result;
    }

    async getConversationFiles(conversationId: string, userId: string) {
        const conversation = await this.repo.findConversation(conversationId);
        if (!conversation) throw new NotFoundException("Conversation not found");
        if (conversation.patientId !== userId && conversation.providerId !== userId) {
            throw new ForbiddenException("Access denied");
        }

        const files = await this.repo.findConversationFiles(conversationId);

        const resolved = await Promise.all(
            files.map(async (f) => ({
                ...f,
                fileUrl: await this.storageService.getSignedUrl(f.fileUrl),
            })),
        );

        const patientName = conversation.patient.patientProfile?.name ?? conversation.patient.name;
        const providerName =
            conversation.provider.doctorProfile?.name ?? conversation.provider.name;

        return {
            patient: {
                id: conversation.patientId,
                name: patientName,
                files: resolved.filter((f) => f.uploadedById === conversation.patientId),
            },
            provider: {
                id: conversation.providerId,
                name: providerName,
                files: resolved.filter((f) => f.uploadedById === conversation.providerId),
            },
        };
    }

    // ── Messages ───────────────────────────────────────────────────────────

    async sendMessage(dto: SendMessageDto, senderId: string, isRecipientActive: boolean = false) {
        const conversation = await this.repo.findConversation(dto.conversationId);
        if (!conversation) throw new NotFoundException("Conversation not found");

        if (conversation.patientId !== senderId && conversation.providerId !== senderId) {
            throw new ForbiddenException("Access denied");
        }

        // Validate all E2E fields are present and non-empty
        if (!dto.senderCopy || !dto.recipientCopy || !dto.iv || !dto.encryptedKey) {
            throw new BadRequestException("Missing encryption fields");
        }

        if (dto.messageType === "PROPOSAL" && !dto.proposal) {
            throw new BadRequestException(
                "proposal object is required when messageType is PROPOSAL",
            );
        }

        if (dto.proposal && dto.messageType !== "PROPOSAL") {
            throw new BadRequestException(
                "messageType must be PROPOSAL when proposal object is provided",
            );
        }

        if (dto.messageType === "ATTACHMENT" && !dto.attachmentId) {
            throw new BadRequestException(
                "attachmentId is required when messageType is ATTACHMENT",
            );
        }

        if (dto.attachmentId && dto.messageType !== "ATTACHMENT") {
            throw new BadRequestException(
                "messageType must be ATTACHMENT when attachmentId is provided",
            );
        }

        if (dto.attachmentId) {
            const attachment = await this.attachmentService.findOne(dto.attachmentId);
            if (!attachment) throw new NotFoundException("Attachment not found");
        }

        const lastMessage = await this.repo.findLastMessageBySender(dto.conversationId, senderId);

        const message = await this.repo.createMessage(dto, senderId);

        const recipientId =
            conversation.patientId === senderId ? conversation.providerId : conversation.patientId;
        const senderName =
            conversation.patientId === senderId
                ? (conversation.patient.patientProfile?.name ?? conversation.patient.name)
                : (conversation.provider.doctorProfile?.name ?? conversation.provider.name);

        const recipientEmail =
            conversation.patientId === senderId
                ? (conversation.provider as any).email
                : (conversation.patient as any).email;
        const recipientName =
            conversation.patientId === senderId
                ? (conversation.provider.doctorProfile?.name ?? conversation.provider.name)
                : (conversation.patient.patientProfile?.name ?? conversation.patient.name);

        if (dto.messageType === "PROPOSAL") {
            await this.notificationService.send({
                userId: recipientId,
                title: "New Proposal",
                message: `You received a new proposal from ${senderName}.`,
                actionType: "NEW_PROPOSAL",
                referenceId: message.id,
            });

            if (recipientEmail) {
                await this.communicationService
                    .dispatch({
                        action: "NEW_PROPOSAL",
                        channel: "EMAIL",
                        to: recipientEmail,
                        payload: { name: recipientName, senderName },
                    })
                    .catch((e) => console.error("Failed to send new proposal email:", e));
            }

            if (conversation.providerId === senderId) {
                await this.notificationService.sendToAdmins({
                    title: "Proposal Sent",
                    message: `Doctor ${senderName} sent a proposal.`,
                    actionType: "PROPOSAL_SENT",
                    referenceId: message.id,
                });
            }
        } else {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            const shouldNotify =
                !isRecipientActive && (!lastMessage || lastMessage.createdAt < fiveMinutesAgo);

            if (shouldNotify) {
                await this.notificationService.send({
                    userId: recipientId,
                    title: "New Message",
                    message: `You have a new message from ${senderName}.`,
                    actionType: "NEW_MESSAGE",
                    referenceId: message.id,
                });

                if (recipientEmail) {
                    await this.communicationService
                        .dispatch({
                            action: "NEW_MESSAGE",
                            channel: "EMAIL",
                            to: recipientEmail,
                            payload: { name: recipientName, senderName },
                        })
                        .catch((e) => console.error("Failed to send new message email:", e));
                }
            }
        }

        return this.resolveMessageAttachments(message);
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    private async resolveMessageAttachments<T extends { attachments: { fileUrl: string }[] }>(
        input: T,
    ): Promise<T>;
    private async resolveMessageAttachments<T extends { attachments: { fileUrl: string }[] }>(
        input: T[],
    ): Promise<T[]>;
    private async resolveMessageAttachments(input: any): Promise<any> {
        const resolve = async (msg: { attachments: { fileUrl: string }[] }) => ({
            ...msg,
            attachments: await Promise.all(
                msg.attachments.map(async (a) => ({
                    ...a,
                    fileUrl: await this.storageService.getSignedUrl(a.fileUrl),
                })),
            ),
        });
        return Array.isArray(input) ? Promise.all(input.map(resolve)) : resolve(input);
    }
}
