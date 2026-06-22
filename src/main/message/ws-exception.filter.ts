import { ArgumentsHost, Catch, WsExceptionFilter as NestWsExceptionFilter } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";

@Catch(WsException)
export class WsExceptionFilter implements NestWsExceptionFilter {
    catch(exception: WsException, host: ArgumentsHost) {
        const client: Socket = host.switchToWs().getClient();
        client.emit("error", { message: exception.message });
    }
}
