import { Module } from "@nestjs/common";
import { PrismaModule } from "@global/prisma/prisma.module";
import { StorageModule } from "@global/storage/storage.module";
import { PublicDoctorController } from "./public-doctor.controller";
import { PublicDoctorService } from "./public-doctor.service";

@Module({
    imports: [PrismaModule, StorageModule],
    controllers: [PublicDoctorController],
    providers: [PublicDoctorService],
})
export class PublicDoctorModule {}
