import { PrismaModule } from "@global/prisma/prisma.module";
import { StorageModule } from "@global/storage/storage.module";
import { Module } from "@nestjs/common";
import { DocumentCenterController } from "./document-center.controller";
import { DocumentCenterRepository } from "./document-center.repository";
import { DocumentCenterService } from "./document-center.service";

@Module({
    imports: [PrismaModule, StorageModule],
    controllers: [DocumentCenterController],
    providers: [DocumentCenterService, DocumentCenterRepository],
})
export class DocumentCenterModule {}
