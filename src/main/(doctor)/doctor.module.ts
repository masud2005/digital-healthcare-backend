import { Module } from "@nestjs/common";
import { DoctorDashboardModule } from "./dashboard/dashboard.module";
import { DoctorMyConsultationModule } from "./my-consultation/my-consultation.module";

@Module({
    imports: [DoctorDashboardModule, DoctorMyConsultationModule],
})
export class DoctorModule {}
