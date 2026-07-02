import { PrismaService } from "@global/prisma/prisma.service";
import { UseFilters, UsePipes, ValidationPipe } from "@nestjs/common";
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsException,
} from "@nestjs/websockets";
import jwt from "jsonwebtoken";
import { Server, Socket } from "socket.io";
import { JoinConversationDto, SendMessageDto } from "./dto/message.dto";
import { MessageService } from "./message.service";
import { OnlineStore } from "./online.store";
import { WsExceptionFilter } from "./ws-exception.filter";

@WebSocketGateway({ cors: { origin: "*" }, namespace: "/chat" })
@UseFilters(WsExceptionFilter)
@UsePipes(new ValidationPipe({ whitelist: true }))
export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

    constructor(
        private readonly prisma: PrismaService,
        private readonly messageService: MessageService,
        private readonly onlineStore: OnlineStore,
    ) {}

    isOnline(userId: string): boolean {
        return this.onlineStore.isOnline(userId);
    }

    async handleConnection(client: Socket) {
        try {
            const token =
                (client.handshake.auth?.token as string) ||
                (client.handshake.headers?.authorization as string)?.slice(7);
            if (!token) throw new WsException("Missing token");

            const payload = jwt.verify(token, process.env.JWT_SECRET || "change_this_secret") as {
                sub: string;
                sid: string;
            };

            const session = await this.prisma.authSession.findFirst({
                where: {
                    id: payload.sid,
                    revokedAt: null,
                    expiresAt: { gt: new Date() },
                    userId: payload.sub,
                },
                include: { user: { select: { id: true, name: true, status: true } } },
            });

            if (!session || session.user.status !== "ACTIVE") throw new WsException("Unauthorized");

            client.data.user = { id: session.user.id, name: session.user.name };
            this.onlineStore.add(session.user.id);
            client.join(`user:${session.user.id}`);

            // Notify all conversation rooms this user is part of
            this.server.emit("user_online", { userId: session.user.id });
        } catch {
            client.emit("error", { message: "Unauthorized" });
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        const user = client.data.user;
        if (!user) return;
        this.onlineStore.remove(user.id);
        client.leave(`user:${user.id}`);
        this.server.emit("user_offline", { userId: user.id });
    }

    @SubscribeMessage("join_conversation")
    async handleJoinConversation(
        @ConnectedSocket() client: Socket,
        @MessageBody() dto: JoinConversationDto,
    ) {
        const userId = client.data.user?.id;
        if (!userId) throw new WsException("Unauthorized");

        const conversation = await this.prisma.conversation.findUnique({
            where: { id: dto.conversationId },
        });
        if (!conversation) throw new WsException("Conversation not found");

        if (conversation.patientId !== userId && conversation.providerId !== userId) {
            throw new WsException("Access denied");
        }

        client.join(`conversation:${dto.conversationId}`);
        client.emit("joined_conversation", { conversationId: dto.conversationId });
    }

    @SubscribeMessage("leave_conversation")
    handleLeaveConversation(
        @ConnectedSocket() client: Socket,
        @MessageBody() dto: JoinConversationDto,
    ) {
        client.leave(`conversation:${dto.conversationId}`);
        client.emit("left_conversation", { conversationId: dto.conversationId });
    }

    /**
     * Client must send E2E encrypted payload:
     * - recipientCopy: message encrypted with recipient's RSA public key
     * - senderCopy:    message encrypted with sender's own RSA public key
     * - iv:            AES-GCM IV used during encryption
     * - encryptedKey:  AES session key encrypted with recipient's RSA public key
     * Server stores & forwards ciphertext only — never sees plaintext.
     */
    @SubscribeMessage("send_message")
    async handleSendMessage(@ConnectedSocket() client: Socket, @MessageBody() dto: SendMessageDto) {
        const userId = client.data.user?.id;
        if (!userId) throw new WsException("Unauthorized");

        const socketsInConvRoom = await this.server.in(`conversation:${dto.conversationId}`).fetchSockets();
        const isRecipientActive = socketsInConvRoom.some((socket) => socket.data?.user?.id !== userId);

        const message = await this.messageService.sendMessage(dto, userId, isRecipientActive);

        // Broadcast encrypted message to everyone in the conversation room
        this.server.to(`conversation:${dto.conversationId}`).emit("new_message", message);

        return { status: "ok", messageId: message.id };
    }

    @SubscribeMessage("typing")
    handleTyping(@ConnectedSocket() client: Socket, @MessageBody() dto: JoinConversationDto) {
        const user = client.data.user;
        if (!user) return;
        client
            .to(`conversation:${dto.conversationId}`)
            .emit("user_typing", { userId: user.id, name: user.name });
    }

    @SubscribeMessage("stop_typing")
    handleStopTyping(@ConnectedSocket() client: Socket, @MessageBody() dto: JoinConversationDto) {
        const user = client.data.user;
        if (!user) return;
        client
            .to(`conversation:${dto.conversationId}`)
            .emit("user_stop_typing", { userId: user.id });
    }
}
