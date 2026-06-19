import { Module } from "@nestjs/common";
import { AdminModule } from "./(admin)/admin.module";
import { ComplianceModule } from "./(compliance)/compliance.module";
import { DoctorModule } from "./(doctor)/doctor.module";
import { PatientModule } from "./(patient)/patient.module";
import { AuthModule } from "./auth/auth.module";

@Module({
    imports: [AdminModule, ComplianceModule, DoctorModule, PatientModule, AuthModule],
})
export class MainModule {}
