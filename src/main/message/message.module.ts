import { PrismaModule } from "@global/prisma/prisma.module";
import { StorageModule } from "@global/storage/storage.module";
import { Module } from "@nestjs/common";
import { MessageController } from "./message.controller";
import { MessageGateway } from "./message.gateway";
import { MessageRepository } from "./message.repository";
import { MessageService } from "./message.service";
import { OnlineStore } from "./online.store";

@Module({
    imports: [PrismaModule, StorageModule],
    controllers: [MessageController],
    providers: [MessageGateway, MessageService, MessageRepository, OnlineStore],
})
export class MessageModule {}
