import { PrismaModule } from "@global/prisma/prisma.module";
import { StorageModule } from "@global/storage/storage.module";
import { Module } from "@nestjs/common";
import { PatientManageController } from "./patient-manage.controller";
import { PatientManageRepository } from "./patient-manage.repository";
import { PatientManageService } from "./patient-manage.service";

@Module({
    imports: [PrismaModule, StorageModule],
    controllers: [PatientManageController],
    providers: [PatientManageService, PatientManageRepository],
})
export class PatientManageModule {}
