import { Module } from "@nestjs/common";
import { RequestRecordModule } from "../../(compliance)/request-record/request-record.module";
import { PublicRequestRecordController } from "./public-request-record.controller";

@Module({
    imports: [RequestRecordModule],
    controllers: [PublicRequestRecordController],
})
export class PublicRequestRecordModule {}
