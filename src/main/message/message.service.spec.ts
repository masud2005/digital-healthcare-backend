import { generateKeyPairSync } from "crypto";
import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { MessageRepository } from "./message.repository";
import { MessageService } from "./message.service";
import { MessageType, SendMessageDto } from "./dto/message.dto";

// Generate a real RSA key once for all tests
const { publicKey: rsaKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const VALID_RSA_PUBLIC_KEY = rsaKey.export({ type: "spki", format: "pem" }) as string;

const mockRepo = {
    upsertPublicKey: jest.fn(),
    getPublicKey: jest.fn(),
    createConversation: jest.fn(),
    findConversation: jest.fn(),
    findUserConversations: jest.fn(),
    getMessages: jest.fn(),
    createMessage: jest.fn(),
};

describe("MessageService", () => {
    let service: MessageService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MessageService, { provide: MessageRepository, useValue: mockRepo }],
        }).compile();

        service = module.get<MessageService>(MessageService);
        jest.clearAllMocks();
    });

    // ── registerPublicKey ─────────────────────────────────────────────────

    describe("registerPublicKey", () => {
        it("throws BadRequestException for invalid RSA key", () => {
            expect(() => service.registerPublicKey("user-1", { publicKey: "not-a-key" })).toThrow(
                BadRequestException,
            );
        });

        it("calls upsertPublicKey with valid RSA key", async () => {
            mockRepo.upsertPublicKey.mockResolvedValue({
                userId: "user-1",
                publicKey: VALID_RSA_PUBLIC_KEY,
            });
            await service.registerPublicKey("user-1", { publicKey: VALID_RSA_PUBLIC_KEY });
            expect(mockRepo.upsertPublicKey).toHaveBeenCalledWith("user-1", VALID_RSA_PUBLIC_KEY);
        });
    });

    // ── getPublicKey ──────────────────────────────────────────────────────

    describe("getPublicKey", () => {
        it("throws NotFoundException when key does not exist", async () => {
            mockRepo.getPublicKey.mockResolvedValue(null);
            await expect(service.getPublicKey("user-1")).rejects.toThrow(NotFoundException);
        });

        it("returns the key record when found", async () => {
            const record = { userId: "user-1", publicKey: "pem" };
            mockRepo.getPublicKey.mockResolvedValue(record);
            await expect(service.getPublicKey("user-1")).resolves.toEqual(record);
        });
    });

    // ── createConversation ────────────────────────────────────────────────

    describe("createConversation", () => {
        const dto = { serviceID: "svc-1", patientId: "pat-1", providerId: "prov-1" };

        it("throws BadRequestException when patient has no public key", async () => {
            mockRepo.getPublicKey
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce({ publicKey: "pem" });
            await expect(service.createConversation(dto)).rejects.toThrow(BadRequestException);
        });

        it("throws BadRequestException when provider has no public key", async () => {
            mockRepo.getPublicKey
                .mockResolvedValueOnce({ publicKey: "pem" })
                .mockResolvedValueOnce(null);
            await expect(service.createConversation(dto)).rejects.toThrow(BadRequestException);
        });

        it("creates conversation when both keys exist", async () => {
            const conversation = { id: "conv-1", ...dto };
            mockRepo.getPublicKey.mockResolvedValue({ publicKey: "pem" });
            mockRepo.createConversation.mockResolvedValue(conversation);

            await expect(service.createConversation(dto)).resolves.toEqual(conversation);
            expect(mockRepo.createConversation).toHaveBeenCalledWith(dto);
        });
    });

    // ── getMessages ───────────────────────────────────────────────────────

    describe("getMessages", () => {
        const conversation = { id: "conv-1", patientId: "pat-1", providerId: "prov-1" };

        it("throws NotFoundException when conversation does not exist", async () => {
            mockRepo.findConversation.mockResolvedValue(null);
            await expect(service.getMessages("conv-1", "pat-1")).rejects.toThrow(NotFoundException);
        });

        it("throws ForbiddenException when user is not a participant", async () => {
            mockRepo.findConversation.mockResolvedValue(conversation);
            await expect(service.getMessages("conv-1", "stranger-id")).rejects.toThrow(
                ForbiddenException,
            );
        });

        it("returns messages for a valid participant", async () => {
            const messages = [{ id: "msg-1", senderId: "pat-1" }];
            mockRepo.findConversation.mockResolvedValue(conversation);
            mockRepo.getMessages.mockResolvedValue(messages);

            await expect(service.getMessages("conv-1", "pat-1")).resolves.toEqual(messages);
            expect(mockRepo.getMessages).toHaveBeenCalledWith("conv-1", undefined);
        });

        it("passes cursor to repository", async () => {
            mockRepo.findConversation.mockResolvedValue(conversation);
            mockRepo.getMessages.mockResolvedValue([]);

            await service.getMessages("conv-1", "prov-1", "cursor-id");
            expect(mockRepo.getMessages).toHaveBeenCalledWith("conv-1", "cursor-id");
        });
    });

    // ── sendMessage ───────────────────────────────────────────────────────

    describe("sendMessage", () => {
        const conversation = { id: "conv-1", patientId: "pat-1", providerId: "prov-1" };
        const validDto: SendMessageDto = {
            conversationId: "conv-1",
            senderCopy: "enc-sender",
            recipientCopy: "enc-recipient",
            iv: "aabbcc",
            encryptedKey: "enc-key",
            messageType: MessageType.TEXT,
        };

        it("throws NotFoundException when conversation does not exist", async () => {
            mockRepo.findConversation.mockResolvedValue(null);
            await expect(service.sendMessage(validDto, "pat-1")).rejects.toThrow(NotFoundException);
        });

        it("throws ForbiddenException when sender is not a participant", async () => {
            mockRepo.findConversation.mockResolvedValue(conversation);
            await expect(service.sendMessage(validDto, "stranger-id")).rejects.toThrow(
                ForbiddenException,
            );
        });

        it("throws BadRequestException when encryption fields are missing", async () => {
            mockRepo.findConversation.mockResolvedValue(conversation);
            const dto = { ...validDto, senderCopy: "" };
            await expect(service.sendMessage(dto, "pat-1")).rejects.toThrow(BadRequestException);
        });

        it("saves and returns the message for a valid sender", async () => {
            const savedMsg = { id: "msg-1", ...validDto, senderId: "pat-1" };
            mockRepo.findConversation.mockResolvedValue(conversation);
            mockRepo.createMessage.mockResolvedValue(savedMsg);

            await expect(service.sendMessage(validDto, "pat-1")).resolves.toEqual(savedMsg);
            expect(mockRepo.createMessage).toHaveBeenCalledWith(validDto, "pat-1");
        });
    });

    // ── getMyConversations ────────────────────────────────────────────────

    describe("getMyConversations", () => {
        it("delegates to repository with userId", () => {
            const conversations = [{ id: "conv-1" }];
            mockRepo.findUserConversations.mockReturnValue(conversations);

            expect(service.getMyConversations("user-1")).toEqual(conversations);
            expect(mockRepo.findUserConversations).toHaveBeenCalledWith("user-1");
        });
    });
});
