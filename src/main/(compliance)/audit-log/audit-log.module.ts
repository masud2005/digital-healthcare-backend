import { Module } from "@nestjs/common";
import { PrismaModule } from "@global/prisma/prisma.module";
import { ExportModule } from "@global/export/export.module";
import { AuditLogController } from "./audit-log.controller";
import { AuditLogRepository } from "./audit-log.repository";
import { AuditLogService } from "./audit-log.service";

@Module({
    imports: [PrismaModule, ExportModule],
    controllers: [AuditLogController],
    providers: [AuditLogService, AuditLogRepository],
    exports: [AuditLogService, AuditLogRepository],
})
export class AuditLogModule {}
