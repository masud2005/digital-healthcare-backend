import { Module } from "@nestjs/common";
import { AdminModule } from "./(admin)/admin.module";
import { ComplianceModule } from "./(compliance)/compliance.module";
import { DoctorModule } from "./(doctor)/doctor.module";
import { PatientModule } from "./(patient)/patient.module";
import { PublicModule } from "./(public)/public.module";
import { AuthModule } from "./auth/auth.module";
import { MessageModule } from "./message/message.module";

@Module({
    imports: [AdminModule, ComplianceModule, DoctorModule, PatientModule, PublicModule, AuthModule, MessageModule],
})
export class MainModule {}
