import { PrismaModule } from "@global/prisma/prisma.module";
import { StorageModule } from "@global/storage/storage.module";
import { Module } from "@nestjs/common";
import { DashboardController } from "./dashboard.controller";
import { DashboardRepository } from "./dashboard.repository";
import { DashboardService } from "./dashboard.service";

@Module({
    imports: [PrismaModule, StorageModule],
    controllers: [DashboardController],
    providers: [DashboardService, DashboardRepository],
})
export class DashboardModule {}
