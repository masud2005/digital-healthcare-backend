import { Module } from "@nestjs/common";
import { PrismaModule } from "@global/prisma/prisma.module";
import { IncidentController } from "./incident.controller";
import { IncidentRepository } from "./incident.repository";
import { IncidentService } from "./incident.service";

@Module({
    imports: [PrismaModule],
    controllers: [IncidentController],
    providers: [IncidentService, IncidentRepository],
    exports: [IncidentService, IncidentRepository],
})
export class IncidentModule {}
