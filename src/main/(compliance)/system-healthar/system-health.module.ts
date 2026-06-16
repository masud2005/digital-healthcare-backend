import { PrismaModule } from "@global/prisma/prisma.module";
import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { SystemHealthController } from "./system-health.controller";
import { SystemHealthInterceptor } from "./system-health.interceptor";
import { SystemHealthRepository } from "./system-health.repository";
import { SystemHealthService } from "./system-health.service";

@Module({
    imports: [PrismaModule],
    controllers: [SystemHealthController],
    providers: [
        SystemHealthService,
        SystemHealthRepository,
        {
            provide: APP_INTERCEPTOR,
            useClass: SystemHealthInterceptor,
        },
    ],
    exports: [SystemHealthService],
})
export class SystemHealthModule {}
