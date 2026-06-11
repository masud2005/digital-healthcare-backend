import { Module } from "@nestjs/common";
import { AdminModule } from "./(admin)/admin.module";
import { ComplianceModule } from "./(compliance)/compliance.module";
import { PatientModule } from "./(patient)/patient.module";
import { AuthModule } from "./auth/auth.module";

@Module({
    imports: [AdminModule, ComplianceModule, PatientModule, AuthModule],
})
export class MainModule {}
