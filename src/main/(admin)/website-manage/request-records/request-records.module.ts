import { Module } from "@nestjs/common";
import { RequestRecordsController } from "./request-records.controller";
import { RequestRecordsService } from "./request-records.service";

@Module({
    controllers: [RequestRecordsController],
    providers: [RequestRecordsService],
})
export class RequestRecordsModule {}
