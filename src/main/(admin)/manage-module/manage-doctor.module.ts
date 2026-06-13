import { PrismaModule } from "@global/prisma/prisma.module";
import { StorageModule } from "@global/storage/storage.module";
import { Module } from "@nestjs/common";
import { ManageDoctorController } from "./controllers/manage-doctor.controller";
import { ManageDoctorRepository } from "./manage-doctor.repository";
import { DoctorMailService } from "./services/doctor-mail.service";
import { ManageDoctorService } from "./services/manage-doctor.service";

@Module({
    imports: [PrismaModule, StorageModule],
    controllers: [ManageDoctorController],
    providers: [ManageDoctorService, ManageDoctorRepository, DoctorMailService],
})
export class ManageDoctorModule {}
