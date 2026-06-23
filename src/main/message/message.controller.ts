import { Roles } from "@common/decorators";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { RolesGuard } from "@common/guards";
import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import type { AuthenticatedUser } from "@main/auth/auth.types";
import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { CreateConversationDto, GetConversationsQueryDto, RegisterPublicKeyDto } from "./dto/message.dto";
import { MessageService } from "./message.service";

@ApiTags("(Patient / Doctor) Message")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("DOCTOR", "PATIENT")
@Controller("message")
export class MessageController {
    constructor(private readonly messageService: MessageService) {}

    // ── Public Key Endpoints ───────────────────────────────────────────────

    @Post("keys/register")
    @ApiOperation({ summary: "Register or update RSA public key for E2E encryption" })
    @ApiBody({ type: RegisterPublicKeyDto })
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
    @ApiBody({ type: CreateConversationDto })
    async createConversation(@Body() dto: CreateConversationDto) {
        const data = await this.messageService.createConversation(dto);
        return { success: true, statusCode: 201, message: "Conversation created", data };
    }

    @Get("conversations")
    @ApiOperation({ summary: "Get all conversations for the current user" })
    @ApiQuery({ name: "search", required: false, description: "Search by patient name, doctor name, or category name" })
    async getMyConversations(@CurrentUser() user: AuthenticatedUser, @Query() query: GetConversationsQueryDto) {
        const data = await this.messageService.getMyConversations(user.id, query.search);
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

    @Get("conversations/:conversationId/service-info")
    @ApiOperation({ summary: "Get service/subscription info for a conversation" })
    async getServiceInfo(@Param("conversationId") conversationId: string, @CurrentUser() user: AuthenticatedUser) {
        const data = await this.messageService.getServiceInfo(conversationId, user.id);
        return { success: true, statusCode: 200, message: "Service info retrieved", data };
    }

    @Patch("conversations/:conversationId/cancel-subscription")
    @ApiOperation({ summary: "Cancel the active subscription linked to a conversation" })
    async cancelSubscription(@Param("conversationId") conversationId: string, @CurrentUser() user: AuthenticatedUser) {
        await this.messageService.cancelSubscription(conversationId, user.id);
        return { success: true, statusCode: 200, message: "Subscription cancelled successfully" };
    }

    @Get("conversations/:conversationId/files")
    @ApiOperation({ summary: "Get all uploaded files in a conversation, grouped by patient and provider" })
    async getConversationFiles(@Param("conversationId") conversationId: string, @CurrentUser() user: AuthenticatedUser) {
        const data = await this.messageService.getConversationFiles(conversationId, user.id);
        return { success: true, statusCode: 200, message: "Files retrieved", data };
    }
}
