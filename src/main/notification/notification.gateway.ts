import { PrismaService } from "@global/prisma/prisma.service";
import { UseFilters, UsePipes, ValidationPipe } from "@nestjs/common";
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import jwt from "jsonwebtoken";
import { Server, Socket } from "socket.io";
import { WsExceptionFilter } from "../message/ws-exception.filter";

@WebSocketGateway({ cors: { origin: "*" }, namespace: "/notifications" })
@UseFilters(WsExceptionFilter)
@UsePipes(new ValidationPipe({ whitelist: true }))
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

    constructor(private readonly prisma: PrismaService) {}

    async handleConnection(client: Socket) {
        try {
            const token =
                (client.handshake.auth?.token as string) ||
                (client.handshake.headers?.authorization as string)?.slice(7);
            if (!token) throw new Error("Missing token");

            const payload = jwt.verify(token, process.env.JWT_SECRET) as {
                sub: string;
                sid: string;
            };

            const session = await this.prisma.authSession.findFirst({
                where: { id: payload.sid, revokedAt: null, expiresAt: { gt: new Date() }, userId: payload.sub },
                select: { userId: true },
            });

            if (!session) throw new Error("Unauthorized");

            client.data.userId = session.userId;
            client.join(`notification:${session.userId}`);
        } catch {
            client.emit("error", { message: "Unauthorized" });
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        if (client.data.userId) {
            client.leave(`notification:${client.data.userId}`);
        }
    }

    /** Push a notification to a specific user in realtime */
    pushToUser(userId: string, notification: object) {
        this.server.to(`notification:${userId}`).emit("notification", notification);
    }
}
