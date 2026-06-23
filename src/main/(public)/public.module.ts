import { Module } from "@nestjs/common";
import { PublicDoctorModule } from "./public-doctor/public-doctor.module";

@Module({
    imports: [PublicDoctorModule],
})
export class PublicModule {}
