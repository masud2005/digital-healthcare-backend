import { Module } from "@nestjs/common";
import { AdminModule } from "./(admin)/admin.module";
import { PatientModule } from "./(patient)/patient.module";
import { AuthModule } from "./auth/auth.module";

@Module({
    imports: [AdminModule, PatientModule, AuthModule],
})
export class MainModule {}
