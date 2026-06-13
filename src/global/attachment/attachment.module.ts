import { PrismaModule } from "@global/prisma/prisma.module";
import { StorageModule } from "@global/storage/storage.module";
import { Global, Module } from "@nestjs/common";
import { AttachmentController } from "./attachment.controller";
import { AttachmentRepository } from "./attachment.repository";
import { AttachmentService } from "./attachment.service";

@Global()
@Module({
    imports: [PrismaModule, StorageModule],
    controllers: [AttachmentController],
    providers: [AttachmentService, AttachmentRepository],
    exports: [AttachmentService],
})
export class AttachmentModule {}
