import { Module } from "@nestjs/common";
import { HippaNoticeController } from "./hippa-notice.controller";
import { HippaNoticeService } from "./hippa-notice.service";

@Module({
    controllers: [HippaNoticeController],
    providers: [HippaNoticeService],
})
export class HippaNoticeModule {}
