import { Module } from "@nestjs/common";
import { StorageModule } from "@global/storage/storage.module";
import { LabTestingController } from "./lab-testing.controller";
import { LabTestingService } from "./lab-testing.service";

@Module({
    imports: [StorageModule],
    controllers: [LabTestingController],
    providers: [LabTestingService],
})
export class LabTestingModule {}
