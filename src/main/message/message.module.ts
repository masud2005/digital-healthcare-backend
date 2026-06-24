import { PrismaModule } from "@global/prisma/prisma.module";
import { StorageModule } from "@global/storage/storage.module";
import { Module } from "@nestjs/common";
import { NotificationModule } from "../notification/notification.module";
import { MessageController } from "./message.controller";
import { MessageGateway } from "./message.gateway";
import { MessageRepository } from "./message.repository";
import { MessageService } from "./message.service";
import { OnlineStore } from "./online.store";

@Module({
    imports: [PrismaModule, StorageModule, NotificationModule],
    controllers: [MessageController],
    providers: [MessageGateway, MessageService, MessageRepository, OnlineStore],
    exports: [MessageService],
})
export class MessageModule {}
