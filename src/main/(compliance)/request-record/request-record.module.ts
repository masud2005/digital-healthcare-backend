import { Module } from "@nestjs/common";
import { PrismaModule } from "@global/prisma/prisma.module";
import { RequestRecordController } from "./request-record.controller";
import { RequestRecordRepository } from "./request-record.repository";
import { RequestRecordService } from "./request-record.service";

@Module({
    imports: [PrismaModule],
    controllers: [RequestRecordController],
    providers: [RequestRecordService, RequestRecordRepository],
    exports: [RequestRecordService],
})
export class RequestRecordModule {}
