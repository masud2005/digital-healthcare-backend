import { CurrentUser } from "@common/decorators/current-user.decorator";
import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import type { AuthenticatedUser } from "@main/auth/auth.types";
import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { CreateConversationDto, RegisterPublicKeyDto } from "./dto/message.dto";
import { MessageService } from "./message.service";

@ApiTags("Message")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("message")
export class MessageController {
    constructor(private readonly messageService: MessageService) {}

    // ── Public Key Endpoints ───────────────────────────────────────────────

    @Post("keys/register")
    @ApiOperation({ summary: "Register or update RSA public key for E2E encryption" })
    async registerPublicKey(@CurrentUser() user: AuthenticatedUser, @Body() dto: RegisterPublicKeyDto) {
        const data = await this.messageService.registerPublicKey(user.id, dto);
        return { success: true, statusCode: 201, message: "Public key registered", data: { userId: data.userId } };
    }

    @Get("keys/:userId")
    @ApiOperation({ summary: "Get RSA public key of a user (to encrypt messages for them)" })
    async getPublicKey(@Param("userId") userId: string) {
        const data = await this.messageService.getPublicKey(userId);
        return { success: true, statusCode: 200, message: "Public key retrieved", data: { userId: data.userId, publicKey: data.publicKey } };
    }

    // ── Conversation Endpoints ─────────────────────────────────────────────

    @Post("conversation")
    @ApiOperation({ summary: "Create a new conversation (both users must have registered public keys)" })
    async createConversation(@Body() dto: CreateConversationDto) {
        const data = await this.messageService.createConversation(dto);
        return { success: true, statusCode: 201, message: "Conversation created", data };
    }

    @Get("conversations")
    @ApiOperation({ summary: "Get all conversations for the current user" })
    async getMyConversations(@CurrentUser() user: AuthenticatedUser) {
        const data = await this.messageService.getMyConversations(user.id);
        return { success: true, statusCode: 200, message: "Conversations retrieved", data };
    }

    @Get("conversations/:conversationId/messages")
    @ApiOperation({ summary: "Get encrypted message history (client decrypts with private key)" })
    @ApiQuery({ name: "cursor", required: false, description: "Last message ID for pagination" })
    async getMessages(
        @Param("conversationId") conversationId: string,
        @CurrentUser() user: AuthenticatedUser,
        @Query("cursor") cursor?: string,
    ) {
        const data = await this.messageService.getMessages(conversationId, user.id, cursor);
        return { success: true, statusCode: 200, message: "Messages retrieved", data };
    }
}
