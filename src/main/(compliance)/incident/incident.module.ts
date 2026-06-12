import { Module } from "@nestjs/common";
import { IncidentController } from "./incident.controller";
import { IncidentRepository } from "./incident.repository";
import { IncidentService } from "./incident.service";

@Module({
    controllers: [IncidentController],
    providers: [IncidentService, IncidentRepository],
    exports: [IncidentService],
})
export class IncidentModule {}
