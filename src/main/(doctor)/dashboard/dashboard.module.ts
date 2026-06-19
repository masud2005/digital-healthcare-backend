import { PrismaModule } from "@global/prisma/prisma.module";
import { Module } from "@nestjs/common";
import { DoctorDashboardController } from "./dashboard.controller";
import { DoctorDashboardRepository } from "./dashboard.repository";
import { DoctorDashboardService } from "./dashboard.service";

@Module({
    imports: [PrismaModule],
    controllers: [DoctorDashboardController],
    providers: [DoctorDashboardService, DoctorDashboardRepository],
})
export class DoctorDashboardModule {}
