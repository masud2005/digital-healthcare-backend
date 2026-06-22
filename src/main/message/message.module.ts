import { PrismaModule } from "@global/prisma/prisma.module";
import { Module } from "@nestjs/common";
import { MessageController } from "./message.controller";
import { MessageGateway } from "./message.gateway";
import { MessageRepository } from "./message.repository";
import { MessageService } from "./message.service";

@Module({
    imports: [PrismaModule],
    controllers: [MessageController],
    providers: [MessageGateway, MessageService, MessageRepository],
})
export class MessageModule {}
