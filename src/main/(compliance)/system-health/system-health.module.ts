import { PrismaModule } from "@global/prisma/prisma.module";
import { Module } from "@nestjs/common";
import { SystemHealthController } from "./system-health.controller";
import { SystemHealthRepository } from "./system-health.repository";
import { SystemHealthService } from "./system-health.service";

@Module({
    imports: [PrismaModule],
    controllers: [SystemHealthController],
    providers: [SystemHealthService, SystemHealthRepository],
    exports: [SystemHealthService],
})
export class SystemHealthModule {}
